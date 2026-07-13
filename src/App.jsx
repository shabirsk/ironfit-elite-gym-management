import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './contexts/MemberAuthContext';
import { gsap } from 'gsap';

// Import new premium landing components
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';

import { lazy, Suspense } from 'react';

// Lazy load below-the-fold components
const Programs = lazy(() => import('./components/landing/Programs'));
const Trainers = lazy(() => import('./components/landing/Trainers'));
const Transformation = lazy(() => import('./components/landing/Transformation'));
const MembershipPlans = lazy(() => import('./components/landing/MembershipPlans'));
const Gallery = lazy(() => import('./components/landing/Gallery'));
const Testimonials = lazy(() => import('./components/landing/Testimonials'));
const Contact = lazy(() => import('./components/landing/Contact'));
const Footer = lazy(() => import('./components/landing/Footer'));
import './styles/landing.css';

import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Leads from './pages/admin/Leads';
import Plans from './pages/admin/Plans';
import Members from './pages/admin/Members';
import AdminTrainers from './pages/admin/Trainers';
import Workouts from './pages/admin/Workouts';
import Attendance from './pages/admin/Attendance';
import Subscriptions from './pages/admin/Subscriptions';
import Payments from './pages/admin/Payments';
import Revenue from './pages/admin/Revenue';
import Automations from './pages/admin/Automations';
import AdminPrograms from './pages/admin/Programs';
import AdminDietPlans from './pages/admin/DietPlans';
import AdminNotifications from './pages/admin/Notifications';
import AdminUploads from './pages/admin/Uploads';
import AdminQRAttendance from './pages/admin/QRAttendance';
import AdminProfile from './pages/admin/AdminProfile';
import RazorpaySettings from './pages/admin/settings/RazorpaySettings';
import SMTPSettings from './pages/admin/settings/SMTPSettings';
import WhatsAppSettings from './pages/admin/settings/WhatsAppSettings';

import MemberLogin from './pages/member/MemberLogin';
import MemberRegister from './pages/member/MemberRegister';
import ForgotPassword from './pages/member/ForgotPassword';
import ResetPassword from './pages/member/ResetPassword';
import MemberLayout from './components/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberAttendance from './pages/member/MemberAttendance';
import MemberWorkouts from './pages/member/MemberWorkouts';
import MemberDietPlans from './pages/member/MemberDietPlans';
import MemberPlans from './pages/member/MemberPlans';
import MemberPayments from './pages/member/MemberPayments';
import MemberNotifications from './pages/member/MemberNotifications';
import MemberProfile from './pages/member/MemberProfile';

import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

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

      {/* Mouse-follow glow effect */}
      <MouseGlow />

      {/* Navigation */}
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero onLoadingComplete={() => setLoading(false)} />
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--iron-black)' }} />}>
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

import { useMotionValue, useSpring, motion as framerMotion } from 'framer-motion';

// Mouse-follow glow component
const MouseGlow = () => {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  
  // Smooth out the movement and ensure it happens off main thread where possible
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };
    // passive: true prevents blocking scroll performance
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="plans" element={<Plans />} />
            <Route path="members" element={<Members />} />
            <Route path="trainers" element={<AdminTrainers />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="qr-attendance" element={<AdminQRAttendance />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="leads" element={<Leads />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="diet-plans" element={<AdminDietPlans />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="uploads" element={<AdminUploads />} />
            <Route path="automations" element={<Automations />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<Navigate to="/admin/settings/razorpay" />} />
            <Route path="settings/razorpay" element={<RazorpaySettings />} />
            <Route path="settings/smtp" element={<SMTPSettings />} />
            <Route path="settings/whatsapp" element={<WhatsAppSettings />} />
          </Route>

          {/* Member Routes */}
          <Route path="/member/login" element={<MemberLogin />} />
          <Route path="/member/register" element={<MemberRegister />} />
          <Route path="/member/forgot-password" element={<ForgotPassword />} />
          <Route path="/member/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/member"
            element={
              <MemberProtectedRoute>
                <MemberLayout />
              </MemberProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="workouts" element={<MemberWorkouts />} />
            <Route path="diet-plans" element={<MemberDietPlans />} />
            <Route path="plans" element={<MemberPlans />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>
        </Routes>
        </ToastProvider>
      </MemberAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
