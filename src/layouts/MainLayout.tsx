import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BellIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDialog } from '@/components/ProfileDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/store';
import { Sidebar } from '@/components/SideBar';
import { getAssetUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  created_at: string;
  read: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { theme, setTheme, subscription } = useSettings();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const bellRef = useRef<HTMLDivElement>(null);
  const boardtheme = getAssetUrl('boardtheme.jpg');
  const avatarUrl = user?.user_metadata?.avatar_url;
  const djName = user?.user_metadata?.dj_name || 'DJ';

  // Fetch and subscribe to unread notifications
  useEffect(() => {
    if (!user) return;

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, created_at, read')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (!error) setNotifications(data || []);
      else console.error('Error fetching notifications:', error.message);
    }

    fetchNotifications();

    const notificationChannel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error.message);
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'} text-foreground flex`}>
      <div className="hidden lg:block">
        <Sidebar subscription={subscription} />
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1a1a1a] shadow-lg">
            <Sidebar subscription={subscription} isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col">
        <div className={`h-16 border-b border-border flex items-center p-3 lg:px-8 shadow-sm ${theme === 'dark' ? 'shadow-slate-700 ' : 'shadow-slate-400'}`}>
          <div className="lg:hidden mr-2">
            <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-accent rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex-1" />

          <div className="relative overflow-hidden h-6 mr-1 lg:mr-9 w-full" />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="w-9 px-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-purple-400" />}
            </Button>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button
                className="p-2 hover:bg-accent rounded-full relative"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <BellIcon className="h-5 w-5 text-muted-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] leading-tight px-[4px] bg-red-500 text-white rounded-full flex items-center justify-center ring-2 ring-background">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] text-popover-foreground border border-border rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-border font-semibold">Notifications</div>
                  <ul className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="text-center p-4 text-sm text-muted-foreground">No unread notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id}>
                          <Link
                            to="/notifications"
                            onClick={() => {
                              markAsRead(notif.id);
                              setNotifOpen(false);
                            }}
                            className="block px-4 mx-4 rounded-md py-3 hover:bg-accent transition"
                          >
                            <div className="text-sm font-medium">{notif.title}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(notif.created_at)}</div>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="border-t border-border p-3 text-sm text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-blue-500 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => setProfileOpen(true)}
              className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-primary hover:opacity-90 transition-opacity"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={djName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-primary-foreground">{djName[0]}</span>
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto relative p-4 lg:p-8">
          <div className="absolute top-0 left-0 w-full h-1/4 pointer-events-none z-0">
            {theme === 'dark' && (
              <img src={boardtheme} alt="Background Event" className="w-full h-full mt-[150px] blur-3xl object-cover opacity-40" />
            )}
          </div>
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ConnectionStatus />
    </div>
  );
}
