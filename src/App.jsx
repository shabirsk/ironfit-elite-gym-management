import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './contexts/MemberAuthContext';
import { useMotionValue, useSpring, motion as framerMotion } from 'framer-motion';

// Lazy-load all landing page below-the-fold components (Hero is critical, keep inline)
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import './styles/landing.css';

// Lazy-load below-the-fold landing components
const Programs = lazy(() => import('./components/landing/Programs'));
const Trainers = lazy(() => import('./components/landing/Trainers'));
const Transformation = lazy(() => import('./components/landing/Transformation'));
const MembershipPlans = lazy(() => import('./components/landing/MembershipPlans'));
const Gallery = lazy(() => import('./components/landing/Gallery'));
const Testimonials = lazy(() => import('./components/landing/Testimonials'));
const Contact = lazy(() => import('./components/landing/Contact'));
const Footer = lazy(() => import('./components/landing/Footer'));

// Lazy-load Admin page components
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Leads = lazy(() => import('./pages/admin/Leads'));
const Plans = lazy(() => import('./pages/admin/Plans'));
const Members = lazy(() => import('./pages/admin/Members'));
const AdminTrainers = lazy(() => import('./pages/admin/Trainers'));
const Workouts = lazy(() => import('./pages/admin/Workouts'));
const Attendance = lazy(() => import('./pages/admin/Attendance'));
const Subscriptions = lazy(() => import('./pages/admin/Subscriptions'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const Revenue = lazy(() => import('./pages/admin/Revenue'));
const Automations = lazy(() => import('./pages/admin/Automations'));
const AdminPrograms = lazy(() => import('./pages/admin/Programs'));
const AdminDietPlans = lazy(() => import('./pages/admin/DietPlans'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminUploads = lazy(() => import('./pages/admin/Uploads'));
const AdminQRAttendance = lazy(() => import('./pages/admin/QRAttendance'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const RazorpaySettings = lazy(() => import('./pages/admin/settings/RazorpaySettings'));
const SMTPSettings = lazy(() => import('./pages/admin/settings/SMTPSettings'));
const WhatsAppSettings = lazy(() => import('./pages/admin/settings/WhatsAppSettings'));

// Lazy-load Member page components
const MemberLogin = lazy(() => import('./pages/member/MemberLogin'));
const MemberRegister = lazy(() => import('./pages/member/MemberRegister'));
const ForgotPassword = lazy(() => import('./pages/member/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/member/ResetPassword'));
const MemberLayout = lazy(() => import('./components/MemberLayout'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const MemberAttendance = lazy(() => import('./pages/member/MemberAttendance'));
const MemberWorkouts = lazy(() => import('./pages/member/MemberWorkouts'));
const MemberDietPlans = lazy(() => import('./pages/member/MemberDietPlans'));
const MemberPlans = lazy(() => import('./pages/member/MemberPlans'));
const MemberPayments = lazy(() => import('./pages/member/MemberPayments'));
const MemberNotifications = lazy(() => import('./pages/member/MemberNotifications'));
const MemberProfile = lazy(() => import('./pages/member/MemberProfile'));

// Critical components kept inline
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const PAGE_LOAD_FALLBACK = <div style={{ minHeight: '100vh', background: '#050505' }} />;
const ADMIN_LOAD_FALLBACK = (
  <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="saas-skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
  </div>
);

const PublicLayout = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 z-[999] bg-iron-black flex flex-col items-center justify-center">
          <div className="flex items-center">
            <span className="font-cinematic text-5xl font-bold tracking-wider text-iron-light">IRON</span>
            <span className="font-cinematic text-5xl font-light text-iron-gold">FIT</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.5em] text-iron-light/60 mt-2 mb-8">Elite</div>
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-iron-gold rounded-full w-1/2 animate-pulse-slow origin-left" style={{ animation: 'loading-bar 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {/* Mouse-follow glow effect — skipped on mobile to avoid framer-motion overhead */}
      <MouseGlow />

      {/* Navigation */}
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero onLoadingComplete={() => setLoading(false)} />
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--iron-black, #050505)' }} />}>
          <Programs />
          <Trainers />
          <Transformation />
          <MembershipPlans />
          <Gallery />
          <Testimonials />
          <Contact />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
};

// Mouse-follow glow component — renders nothing on mobile/touch to save CPU
const MouseGlow = () => {
  const [isTouch, setIsTouch] = useState(true);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    // Detect that this is NOT a touch device by waiting for a real mouse move
    const handleFirstMouse = () => {
      setIsTouch(false);
      window.removeEventListener('mousemove', handleFirstMouse);
    };
    window.addEventListener('mousemove', handleFirstMouse, { once: true, passive: true });
    return () => window.removeEventListener('mousemove', handleFirstMouse);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const handleMouse = (e) => {
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [isTouch, mouseX, mouseY]);

  // Render nothing on touch devices — avoids spring animation overhead
  if (isTouch) return null;

  return (
    <framerMotion.div
      className="fixed pointer-events-none z-0 w-[400px] h-[400px] rounded-full bg-iron-gold/5 blur-[100px] mix-blend-screen"
      style={{ x: smoothX, y: smoothY, willChange: 'transform' }}
    />
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && user.role === 'admin' ? children : <Navigate to="/admin/login" />;
};

const MemberProtectedRoute = ({ children }) => {
  const { user, loading } = useMemberAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/member/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MemberAuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<PublicLayout />} />
          <Route path="/admin/login" element={
            <Suspense fallback={PAGE_LOAD_FALLBACK}><AdminLogin /></Suspense>
          } />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Suspense fallback={ADMIN_LOAD_FALLBACK}>
                    <AdminLayout />
                  </Suspense>
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Dashboard /></Suspense>} />
            <Route path="plans" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Plans /></Suspense>} />
            <Route path="members" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Members /></Suspense>} />
            <Route path="trainers" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminTrainers /></Suspense>} />
            <Route path="workouts" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Workouts /></Suspense>} />
            <Route path="attendance" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Attendance /></Suspense>} />
            <Route path="qr-attendance" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminQRAttendance /></Suspense>} />
            <Route path="subscriptions" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Subscriptions /></Suspense>} />
            <Route path="payments" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Payments /></Suspense>} />
            <Route path="revenue" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Revenue /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Leads /></Suspense>} />
            <Route path="programs" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminPrograms /></Suspense>} />
            <Route path="diet-plans" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminDietPlans /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminNotifications /></Suspense>} />
            <Route path="uploads" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminUploads /></Suspense>} />
            <Route path="automations" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><Automations /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><AdminProfile /></Suspense>} />
            <Route path="settings" element={<Navigate to="/admin/settings/razorpay" />} />
            <Route path="settings/razorpay" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><RazorpaySettings /></Suspense>} />
            <Route path="settings/smtp" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><SMTPSettings /></Suspense>} />
            <Route path="settings/whatsapp" element={<Suspense fallback={ADMIN_LOAD_FALLBACK}><WhatsAppSettings /></Suspense>} />
          </Route>

          {/* Member Routes */}
          <Route path="/member/login" element={
            <Suspense fallback={PAGE_LOAD_FALLBACK}><MemberLogin /></Suspense>
          } />
          <Route path="/member/register" element={
            <Suspense fallback={PAGE_LOAD_FALLBACK}><MemberRegister /></Suspense>
          } />
          <Route path="/member/forgot-password" element={
            <Suspense fallback={PAGE_LOAD_FALLBACK}><ForgotPassword /></Suspense>
          } />
          <Route path="/member/reset-password/:token" element={
            <Suspense fallback={PAGE_LOAD_FALLBACK}><ResetPassword /></Suspense>
          } />

          <Route
            path="/member"
            element={
              <MemberProtectedRoute>
                <Suspense fallback={PAGE_LOAD_FALLBACK}>
                  <MemberLayout />
                </Suspense>
              </MemberProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" />} />
            <Route path="dashboard" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberDashboard /></Suspense>} />
            <Route path="attendance" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberAttendance /></Suspense>} />
            <Route path="workouts" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberWorkouts /></Suspense>} />
            <Route path="diet-plans" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberDietPlans /></Suspense>} />
            <Route path="plans" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberPlans /></Suspense>} />
            <Route path="payments" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberPayments /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberNotifications /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={PAGE_LOAD_FALLBACK}><MemberProfile /></Suspense>} />
          </Route>
        </Routes>
        </ToastProvider>
      </MemberAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
