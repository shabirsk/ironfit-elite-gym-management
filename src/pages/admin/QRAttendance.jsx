import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scanAdminQRCode, getAttendance } from '../../api/attendance';

const QRAttendance = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef(null);

  const fetchRecentScans = async () => {
    try {
      const { records } = await getAttendance({ limit: 10, date: new Date().toISOString() });
      setRecentScans(records || []);
    } catch (err) {
      console.error('Failed to fetch recent scans', err);
    }
  };

  useEffect(() => {
    fetchRecentScans();
    
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      } else {
        setErrorMsg('No cameras found on this device.');
      }
    }).catch(err => {
      setErrorMsg('Camera permissions denied or not supported.');
      console.error(err);
    });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCamera) return;
    setErrorMsg('');
    setScanResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
      );
      setIsScanning(true);
    } catch (err) {
      setErrorMsg('Failed to start camera. Please check permissions.');
      console.error("Scanner start error:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (loading) return;
    setLoading(true);
    setScanResult({ type: 'info', message: 'QR Code detected. Verifying...' });
    
    try {
      if (scannerRef.current && isScanning) {
         scannerRef.current.pause(true); // Pause the scanner
      }

      await scanAdminQRCode(decodedText);
      
      setScanResult({ type: 'success', message: 'Attendance marked successfully!' });
      fetchRecentScans();
      
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed. Invalid QR.';
      setScanResult({ type: 'error', message: msg });
    } finally {
      setLoading(false);
      // Resume scanning after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        if (scannerRef.current && isScanning) {
           try {
             scannerRef.current.resume();
           } catch(e) {
             console.error("Resume error", e);
           }
        }
      }, 3000);
    }
  };

  const onScanFailure = (error) => {
    // Ignore routine scan failures (when no QR is in view)
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>QR Attendance Scanner</h1>
          <p className="text-secondary text-sm">Scan member QR codes for rapid check-ins.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="saas-card" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
             {cameras.length > 0 ? (
               <select 
                 className="saas-input"
                 style={{ flex: 1, marginBottom: 0 }}
                 value={selectedCamera} 
                 onChange={(e) => setSelectedCamera(e.target.value)}
                 disabled={isScanning}
               >
                 {cameras.map(c => (
                   <option key={c.id} value={c.id}>{c.label || `Camera ${c.id}`}</option>
                 ))}
               </select>
             ) : (
               <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0, alignSelf: 'center' }}>Looking for cameras...</p>
             )}
             
             {!isScanning ? (
                <button className="saas-btn saas-btn-primary" onClick={startScanner} disabled={!selectedCamera}>Start Scanner</button>
             ) : (
                <button className="saas-btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={stopScanner}>Stop Scanner</button>
             )}
          </div>

          {errorMsg && <div style={{ background: 'var(--status-error-bg)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '16px', fontSize: '14px' }}>{errorMsg}</div>}

          <div id="qr-reader" style={{ width: '100%', minHeight: '300px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}></div>
          
          {scanResult && (
            <div style={{ 
              marginTop: '16px', padding: '16px', borderRadius: '8px', fontWeight: 500, textAlign: 'center', fontSize: '14px',
              background: scanResult.type === 'success' ? 'var(--status-success-bg)' : scanResult.type === 'error' ? 'var(--status-error-bg)' : 'var(--bg-surface)',
              color: scanResult.type === 'success' ? 'var(--success)' : scanResult.type === 'error' ? 'var(--danger)' : 'var(--primary)',
              border: '1px solid var(--border-light)'
            }}>
              {scanResult.message}
            </div>
          )}
        </div>

        <div className="saas-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>Today's Recent Scans</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentScans.map(record => (
              <div key={record._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-focus)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>
                  {record.memberId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{record.memberId?.fullName || 'Unknown'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{record.memberId?.email || 'N/A'}</div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>
                  {record.checkInTime}
                </div>
              </div>
            ))}
            {recentScans.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0', fontSize: '14px' }}>No scans today yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAttendance;
