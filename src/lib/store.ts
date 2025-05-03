import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  theme: 'dark' | 'light';
  showVoteCount: boolean;
  requestLimit: number;
  subscription: {
    plan: 'free' | 'pro';
    eventsCreated: number;
    expiresAt: string | null; // ISO timestamp
  };
  setTheme: (theme: 'dark' | 'light') => void;
  setShowVoteCount: (show: boolean) => void;
  setRequestLimit: (limit: number) => void;
  incrementEventsCreated: () => void;
  setPlan: (plan: 'free' | 'pro', expiresAt?: string | null) => void;
  resetEventsCreated: () => void;
  canCreateEvent: () => boolean;
  checkAndExpirePlan: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      showVoteCount: true,
      requestLimit: 3,
      subscription: {
        plan: 'free',
        eventsCreated: 0,
        expiresAt: null,
      },
      setTheme: (theme) => set({ theme }),
      setShowVoteCount: (showVoteCount) => set({ showVoteCount }),
      setRequestLimit: (requestLimit) => set({ requestLimit }),
      incrementEventsCreated: () =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            eventsCreated: state.subscription.eventsCreated + 1,
          },
        })),
      setPlan: (plan, expiresAt = null) =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            plan,
            expiresAt,
            eventsCreated: 0,
          },
        })),
      resetEventsCreated: () =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            eventsCreated: 0,
          },
        })),
      canCreateEvent: () => {
        const state = get();
        if (state.subscription.plan === 'free') {
          return state.subscription.eventsCreated < 1;
        }
        return true;
      },
      checkAndExpirePlan: () => {
        const state = get();
        const now = new Date();
        const expires = state.subscription.expiresAt
          ? new Date(state.subscription.expiresAt)
          : null;

        if (
          state.subscription.plan === 'pro' &&
          expires &&
          now > expires
        ) {
          set({
            subscription: {
              plan: 'free',
              eventsCreated: 0,
              expiresAt: null,
            },
          });

        }
      },
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
      }),
    }
  )
);
