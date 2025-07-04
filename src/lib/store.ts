import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SubscriptionPlan {
  plan: 'trial' | 'pro'| 'lifetime' | null;
  eventsCreated: number;
  expiresAt: string | null;
  expired: boolean;
}

interface SettingsState {
  theme: 'dark' | 'light';
  showVoteCount: boolean;
  requestLimit: number;
  subscription: SubscriptionPlan | null;
  hasSeenTutorial: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  setShowVoteCount: (show: boolean) => void;
  setRequestLimit: (limit: number) => void;
  incrementEventsCreated: () => void;
  setPlan: (
    plan: 'trial' | 'pro' | 'lifetime' | null,
    expiresAt?: string | null,
    expired?: boolean
  ) => void;
  
  resetEventsCreated: () => void;
  canCreateEvent: () => boolean;
  checkAndExpirePlan: () => void;
  setHasSeenTutorial: (seen: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      showVoteCount: true,
      requestLimit: 3,
      subscription: null,
      hasSeenTutorial: false,

      setTheme: (theme) => set({ theme }),
      setShowVoteCount: (showVoteCount) => set({ showVoteCount }),
      setRequestLimit: (requestLimit) => set({ requestLimit }),

      incrementEventsCreated: () => {
        const { subscription } = get();
        if (subscription) {
          set({
            subscription: {
              ...subscription,
              eventsCreated: subscription.eventsCreated + 1,
            },
          });
        }
      },

      setPlan: (plan, expiresAt = null, expired = false) => {
        if (plan === 'lifetime') {
          return set(() => ({
            subscription: {
              plan,
              eventsCreated: 0,
              expiresAt: null,
              expired: false,
            },
          }));
        }
      
        return set(() => ({
          subscription: {
            plan,
            eventsCreated: 0,
            expiresAt,
            expired,
          },
        }));
      },
      

      resetEventsCreated: () => {
        const { subscription } = get();
        if (subscription) {
          set({
            subscription: {
              ...subscription,
              eventsCreated: 0,
            },
          });
        }
      },

      canCreateEvent: () => {
        const { subscription } = get();
        if (!subscription) return false;
        return true;
      },

      checkAndExpirePlan: () => {
        const { subscription } = get();
        if (
          subscription &&
          (subscription.plan === 'pro' || subscription.plan === 'trial') &&
          subscription.expiresAt
        ) {
          const now = new Date();
          const expires = new Date(subscription.expiresAt);
          const expired = now > expires;

          if (subscription.expired !== expired) {
            set({
              subscription: {
                ...subscription,
                expired,
              },
            });
          }
        }
      },

      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),
    }),
    {
      name: 'dj-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        subscription: state.subscription,
        showVoteCount: state.showVoteCount,
        requestLimit: state.requestLimit,
        hasSeenTutorial: state.hasSeenTutorial,
      }),
    }
  )
);
