import React from 'react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route, Navigate,useNavigate } from 'react-router-dom';
import DJDashboard from '@/pages/DJDashboard';
import EventsPage from '@/pages/EventsPage';
import EventDetails from '@/pages/EventDetails';
import AttendeeView from '@/pages/AttendeeView';
import Settings from '@/pages/Settings';
import PricingPage from '@/pages/PricingPage';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import ContactPage from './pages/ContactPage';
import NotificationPage from './pages/NotificationsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/store';
import { performanceMonitor } from '@/lib/performance-monitor';
import { logger } from '@/lib/logger';
import { MainLayout } from '@/layouts/MainLayout';

import  StripeFailurePage  from '@/pages/StripeFailurePage';
import StripeSuccessPage from "@/pages/StripeSuccessPage"

export default function App() {
  const { user } = useAuth();
  const { theme, subscription } = useSettings();
  const navigate = useNavigate();

  
  useEffect(() => {
    // Monitor initial app load performance
    performanceMonitor.mark('app-init');

    // Log app initialization
    logger.info('Application initialized', {
      theme,
    });

    return () => {
      performanceMonitor.measure('app-total-time', 'app-init');
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);


  // Redirect to /pricing if user is logged in but plan is not selected
useEffect(() => {

  if (user && (!subscription || !subscription.plan || subscription.plan === null )) {
    navigate('/pricing');
  }
}, [user, subscription, navigate]);
  
 

  //Initialize aos
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: 'ease-in-sine',
      delay: 100,
    });
    AOS.refresh();
  }, []);

  // Check if this is an attendee route
  const isAttendeeRoute = window.location.pathname.startsWith('/event/');
  if (isAttendeeRoute) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Routes>
          <Route path="/event/:eventId" element={<AttendeeView />} />
        </Routes>
      </div>
    );
  }

  // Public routes
  if (!user) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/success" element={<StripeSuccessPage />} />
          <Route path="/failure" element={<StripeFailurePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </div>
    );
  }



  // Protected routes
  return (
    <Routes>
    {/*Routes outside of MainLayout */}
    <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/success" element={<StripeSuccessPage />} />
      <Route path="/failure" element={<StripeFailurePage />} />
    {/*Routes inside MainLayout */}
    <Route
      path="*"
      element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DJDashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
          </Routes>
        </MainLayout>
      }
    />
  </Routes>
  );
}