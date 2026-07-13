import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px', borderRadius: 8, fontSize: 13,
            background: t.type === 'success' ? '#1a3a1a' : '#3a1a1a',
            border: '1px solid ' + (t.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'),
            color: t.type === 'success' ? '#22c55e' : '#ef4444',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            maxWidth: 360, wordBreak: 'break-word',
            animation: 'toastSlideIn 0.25s ease',
          }}>{t.message}</div>
        ))}
      </div>
      <style>{`@keyframes toastSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
