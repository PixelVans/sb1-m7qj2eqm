import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOfflineTime, setLastOfflineTime] = useState<number | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);

  const checkSupabaseConnection = useCallback(async () => {
    try {
      // Simple ping to Supabase to check connection
      const { error } = await supabase.from('events').select('id').limit(1);
      
      const isConnected = !error;
      setIsSupabaseConnected(isConnected);
      
      return isConnected;
    } catch (error) {
      setIsSupabaseConnected(false);
      logger.error('Supabase connection check failed:', { error });
      return false;
    }
  }, []);

  const handleOnline = useCallback(async () => {
    setIsOnline(true);
    
    // Only show toast if we were previously offline
    if (lastOfflineTime !== null) {
      const offlineDuration = Math.round((Date.now() - lastOfflineTime) / 1000);
      toast.success(`Connection restored`, {
        description: offlineDuration > 60 
          ? `You were offline for ${Math.floor(offlineDuration / 60)} min ${offlineDuration % 60} sec` 
          : `You were offline for ${offlineDuration} seconds`
      });
      setLastOfflineTime(null);
      
      // Check Supabase connection when coming back online
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error('Database connection issue', {
          description: 'Connected to internet but unable to reach database. Some features may be limited.'
        });
      }
    }
    
    logger.info('Network connection restored');
  }, [lastOfflineTime, checkSupabaseConnection]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setLastOfflineTime(Date.now());
    setIsSupabaseConnected(false);
    
    toast.error('No internet connection', {
      description: 'Please check your connection and try again',
    });
    
    logger.warn('Network connection lost');
  }, []);

  const retryConnection = useCallback(async () => {
    // Try to fetch a small resource to test connection
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!isOnline) {
        // If we're marked as offline but the fetch succeeded, update status
        setIsOnline(true);
        handleOnline();
        
        // Also check Supabase connection
        await checkSupabaseConnection();
      }
    } catch (error) {
      // If fetch fails, ensure we're marked as offline
      if (isOnline) {
        setIsOnline(false);
        handleOffline();
      } else {
        toast.error('Still offline', {
          description: 'Please check your internet connection'
        });
      }
    }
  }, [isOnline, handleOnline, handleOffline, checkSupabaseConnection]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    if (!navigator.onLine) {
      setIsOnline(false);
      setLastOfflineTime(Date.now());
    } else {
      // Check Supabase connection on initial load
      checkSupabaseConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, checkSupabaseConnection]);

  return { 
    isOnline, 
    isSupabaseConnected,
    retryConnection, 
    checkSupabaseConnection,
    lastOfflineTime 
  };
}