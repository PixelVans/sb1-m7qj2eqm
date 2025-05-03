import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button.'
  );
}

// Create a custom fetch function with timeout
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}, timeout = 15000) => {
  return new Promise<Response>((resolve, reject) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    fetch(url, {
      ...options,
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          reject(new Error('Request timeout - server took too long to respond'));
        } else {
          reject(error);
        }
      });
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage,
  },
  global: {
    fetch: (url, options) => {
      return fetchWithTimeout(url, options)
        .catch(err => {
          console.error('Supabase fetch error:', err);
          // Add more context to the error
          if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection and try again.');
          }
          if (err.message === 'Failed to fetch') {
            throw new Error('Unable to connect to authentication service. Please check your internet connection or try again later.');
          }
          throw err;
        });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Types for our database tables
export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          created_at: string;
          dj_id: string;
          name: string;
          active: boolean;
          start_time: string | null;
          end_time: string | null;
          location: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          dj_id: string;
          name: string;
          active?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          dj_id?: string;
          name?: string;
          active?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
        };
      };
      song_requests: {
        Row: {
          id: string;
          created_at: string;
          event_id: string;
          title: string;
          artist: string;
          votes: number;
          played: boolean;
          is_pre_request: boolean;
          song_link: string | null;
          rejected: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_id: string;
          title: string;
          artist: string;
          votes?: number;
          played?: boolean;
          is_pre_request?: boolean;
          song_link?: string | null;
          rejected?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_id?: string;
          title?: string;
          artist?: string;
          votes?: number;
          played?: boolean;
          is_pre_request?: boolean;
          song_link?: string | null;
          rejected?: boolean;
        };
      };
    };
  };
};