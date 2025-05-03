import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DJDashboard from '@/pages/DJDashboard';
import EventsPage from '@/pages/EventsPage';
import EventDetails from '@/pages/EventDetails';
import AttendeeView from '@/pages/AttendeeView';
import Settings from '@/pages/Settings';
import PricingPage from '@/pages/PricingPage';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/store';
import { performanceMonitor } from '@/lib/performance-monitor';
import { logger } from '@/lib/logger';
import { MainLayout } from '@/layouts/MainLayout';
import { supabase } from '@/lib/supabase';
import  StripeFailurePage  from '@/pages/StripeFailurePage';
import StripeSuccessPage from "@/pages/StripeSuccessPage"


export default function App() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const { setPlan, } = useSettings();

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

// fetch user info from Supabase and update Zustand
  useEffect(() => {
    if (user?.id) {
      syncSubscription(); 
      
    }
  }, [user?.id]);
  
  async function syncSubscription() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return;
    console.log(data?.user)
    const latestPlan = data.user.user_metadata?.subscription_plan || 'free';
    
    console.log(latestPlan)
    const currentPlan = useSettings.getState().subscription.plan;
  
    if (latestPlan !== currentPlan) {
      setPlan(latestPlan); 
    }
  }

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }


  // Protected routes
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DJDashboard />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/success" element={<StripeSuccessPage />} />
        <Route path="/failure" element={<StripeFailurePage />} />
      </Routes>
    </MainLayout>
  );
}