import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionOptions {
  event?: RealtimeEvent;
  schema?: string;
  table: string;
  filter?: string;
}

export function useRealtimeSubscription(
  options: SubscriptionOptions,
  callback: (payload: any) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const { event = '*', schema = 'public', table, filter } = options;

    channelRef.current = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [options.table, options.filter]);

  return channelRef.current;
}