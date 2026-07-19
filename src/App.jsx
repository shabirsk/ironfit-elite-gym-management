import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './contexts/MemberAuthContext';
import { useMotionValue, useSpring, motion as framerMotion } from 'framer-motion';

// Hero and Navbar are inline — they render immediately with static data, no API calls
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import './styles/landing.css';

// Viewport-based lazy loader — loads children only when they scroll into view
import LazySection from './components/LazySection';

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

import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// ─── Skeleton placeholders for below-fold sections ───

const SectionSkeleton = ({ height = '100vh' }) => (
  <div
    className="landing-page"
    style={{
      height,
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      className="saas-skeleton"
      style={{ width: 48, height: 48, borderRadius: '50%', opacity: 0.3 }}
    />
  </div>
);

// ─── Mouse-follow glow — returns null on touch to avoid spring overhead ───

const MouseGlow = () => {
  const [isTouch, setIsTouch] = useState(true);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
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

  if (isTouch) return null;

  return (
    <framerMotion.div
      className="fixed pointer-events-none z-0 w-[400px] h-[400px] rounded-full bg-iron-gold/5 blur-[100px] mix-blend-screen"
      style={{ x: smoothX, y: smoothY, willChange: 'transform' }}
    />
  );
};

// ─── PublicLayout — renders Hero immediately, lazy-loads everything else ───

const PublicLayout = () => {
  // Remove the HTML skeleton once React has committed the Hero render.
  // The skeleton sits OUTSIDE #root so createRoot doesn't clear it.
  useEffect(() => {
    const skeleton = document.getElementById('app-skeleton');
    if (skeleton) {
      skeleton.style.transition = 'opacity 0.4s ease';
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton?.remove(), 400);
    }
  }, []);

  return (
    <>
    <MouseGlow />
    <Navbar />
    <main style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero renders instantly — no loading screen, no API calls */}
      <Hero />

      {/* Below-fold sections are code-split AND viewport-lazy:
           1. React.lazy() splits the JS into separate chunks
           2. LazySection waits until the user scrolls near them before triggering the chunk download
           3. Suspense shows skeleton while the chunk downloads
      */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Programs />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Trainers />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Transformation />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <MembershipPlans />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Gallery />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Testimonials />
        </LazySection>
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazySection placeholder={<SectionSkeleton />}>
          <Contact />
        </LazySection>
      </Suspense>
    </main>

    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  </>
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
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><AdminLogin /></Suspense>
          } />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}>
                    <AdminLayout />
                  </Suspense>
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Dashboard /></Suspense>} />
            <Route path="plans" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Plans /></Suspense>} />
            <Route path="members" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Members /></Suspense>} />
            <Route path="trainers" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminTrainers /></Suspense>} />
            <Route path="workouts" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Workouts /></Suspense>} />
            <Route path="attendance" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Attendance /></Suspense>} />
            <Route path="qr-attendance" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminQRAttendance /></Suspense>} />
            <Route path="subscriptions" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Subscriptions /></Suspense>} />
            <Route path="payments" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Payments /></Suspense>} />
            <Route path="revenue" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Revenue /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Leads /></Suspense>} />
            <Route path="programs" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminPrograms /></Suspense>} />
            <Route path="diet-plans" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminDietPlans /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminNotifications /></Suspense>} />
            <Route path="uploads" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminUploads /></Suspense>} />
            <Route path="automations" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><Automations /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><AdminProfile /></Suspense>} />
            <Route path="settings" element={<Navigate to="/admin/settings/razorpay" />} />
            <Route path="settings/razorpay" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><RazorpaySettings /></Suspense>} />
            <Route path="settings/smtp" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><SMTPSettings /></Suspense>} />
            <Route path="settings/whatsapp" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}><WhatsAppSettings /></Suspense>} />
          </Route>

          <Route path="/member/login" element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberLogin /></Suspense>
          } />
          <Route path="/member/register" element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberRegister /></Suspense>
          } />
          <Route path="/member/forgot-password" element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><ForgotPassword /></Suspense>
          } />
          <Route path="/member/reset-password/:token" element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><ResetPassword /></Suspense>
          } />

          <Route
            path="/member"
            element={
              <MemberProtectedRoute>
                <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
                  <MemberLayout />
                </Suspense>
              </MemberProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" />} />
            <Route path="dashboard" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberDashboard /></Suspense>} />
            <Route path="attendance" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberAttendance /></Suspense>} />
            <Route path="workouts" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberWorkouts /></Suspense>} />
            <Route path="diet-plans" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberDietPlans /></Suspense>} />
            <Route path="plans" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberPlans /></Suspense>} />
            <Route path="payments" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberPayments /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberNotifications /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><MemberProfile /></Suspense>} />
          </Route>
        </Routes>
        </ToastProvider>
      </MemberAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
