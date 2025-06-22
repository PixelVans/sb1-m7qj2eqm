import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/lib/store';
import { logger } from '@/lib/logger';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setPlan, resetEventsCreated } = useSettings();
  const authCheckAttempts = useRef(0);
  const maxAuthCheckAttempts = 3;

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        authCheckAttempts.current += 1;
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session:', { error, attempt: authCheckAttempts.current });

          if (authCheckAttempts.current < maxAuthCheckAttempts) {
            const backoffTime = Math.pow(2, authCheckAttempts.current) * 1000;
            logger.info(`Retrying session check in ${backoffTime}ms`);
            setTimeout(getInitialSession, backoffTime);
            return;
          } else {
            throw error;
          }
        }

        setUser(session?.user ?? null);

        if (session?.user?.user_metadata?.subscription_plan) {
          const plan = session.user.user_metadata.subscription_plan;
          const expiresAt = session.user.user_metadata.subscription_expires;
          const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false;
        
          setPlan(plan, expiresAt, isExpired);
        }

        logger.info('Session check completed successfully');
      } catch (error) {
        console.error('Session retrieval error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);

      if (newUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        if (event === 'SIGNED_IN' && newUser.app_metadata.provider === 'apple') {
          const { given_name, family_name } = newUser.user_metadata;
          const displayName = [given_name, family_name].filter(Boolean).join(' ');

          try {
            await supabase.auth.updateUser({
              data: {
                dj_name: displayName || 'DJ',
              }
            });

            // Redirect to start-free-trial page for new users
            navigate('/select-plan');
          } catch (error) {
            logger.error('Error updating user after Apple sign-in:', { error });
            toast.error('Failed to complete sign-in process');
          }
        } else {
          // Show toast only if it hasn’t been shown this session
          const alreadyWelcomed = sessionStorage.getItem('hasWelcomed');
          if (!alreadyWelcomed) {
            sessionStorage.setItem('hasWelcomed', 'true');
            toast.success('Welcome back!', {
              description: `Signed in as ${newUser.user_metadata.dj_name || 'DJ'}`,
            });
          }
        }

        // Update subscription plan from user metadata
        if (newUser.user_metadata?.subscription_plan) {
          const plan = newUser.user_metadata.subscription_plan;
          const expiresAt = newUser.user_metadata.subscription_expires;
          const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false;
        
          setPlan(plan, expiresAt, isExpired);
        }

        resetEventsCreated();
      }

      // Handle session expiration

      if (event === 'TOKEN_REFRESHED') {
        logger.info('Session token refreshed');
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setUser(null);
        resetEventsCreated();
        sessionStorage.removeItem('hasWelcomed'); // Clear welcome flag on logout
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      logger.error('Error signing out:', { error });
      toast.error('Error signing out', {
        description: error.message || 'An unexpected error occurred'
      });
    }
  };

  return { user, loading, signOut };
}
