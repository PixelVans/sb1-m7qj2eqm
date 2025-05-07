import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BellIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDialog } from '@/components/ProfileDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/store';
import { Sidebar } from '@/components/SideBar';
import { getAssetUrl } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { theme, setTheme, subscription } = useSettings();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);

  const boardtheme = getAssetUrl('boardtheme.jpg');
  const avatarUrl = user?.user_metadata?.avatar_url;
  const djName = user?.user_metadata?.dj_name || 'DJ';

  const notifications = [
    { id: 1, title: 'New follower', time: '2m ago' },
    { id: 2, title: 'Event approved', time: '10m ago' },
    { id: 3, title: 'Payment received', time: '1h ago' },
    { id: 4, title: 'Reminder: Upcoming gig', time: '3h ago' },
    { id: 5, title: 'New request on event', time: '1d ago' },
  ];

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'} text-foreground flex`}>
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar subscription={subscription} />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1a1a1a] shadow-lg ">
            <Sidebar
              subscription={subscription}
              isMobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`h-16 border-b border-border flex items-center p-3 lg:px-8 shadow-sm ${theme === 'dark' ? 'shadow-slate-700 ' : 'shadow-slate-400'}`}>
          <div className="lg:hidden mr-2">
            <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-accent rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex-1" />

          <div className="relative overflow-hidden h-6 mr-1 lg:mr-9 w-full">
            <div className={`marquee text-lg font-extralight font-rajdhani ${theme === 'dark' ? 'text-yellow-200' : 'text-black'} text-foreground flex`}>
              {subscription.plan === 'pro'
                ? `Welcome, ${djName}! You are a Pro DJ. Enjoy unlimited events, pre-event song requests, custom branding, analytics, and premium support to elevate every gig.`
                : `Hey ${djName}, you're currently on the Free Plan. You can create 1 event with basic features. Upgrade to Pro for unlimited events, pre-event requests, custom branding, analytics, and more—only $9.99/month.`}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-9 px-0"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-purple-400" />
              )}
            </Button>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
            <button
                  className="p-2 hover:bg-accent rounded-full relative"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <BellIcon className="h-5 w-5 text-muted-foreground" />
                  
                  {/* Green Dot */}
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </button>
             {/* notification modal toggle */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] text-popover-foreground border border-border rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-border font-semibold">Notifications</div>
                  <ul className="max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <li key={notif.id}>
                        <Link
                          to="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 mx-4 rounded-md py-3 hover:bg-accent transition"
                        >
                          <div className="text-sm font-medium">{notif.title}</div>
                          <div className="text-xs text-muted-foreground">{notif.time}</div>
                        </Link>
                      </li>
                    ))}
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
                <img
                  src={avatarUrl}
                  alt={djName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-primary-foreground">
                  {djName[0]}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto relative p-4 lg:p-8">
          <div className="absolute top-0 left-0 w-full h-1/4 pointer-events-none z-0">
            {theme === 'dark' && (
              <img
                src={boardtheme}
                alt="Background Event"
                className="w-full h-full mt-[150px] blur-3xl object-cover opacity-40"
              />
            )}
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ConnectionStatus />
    </div>
  );
}

function NavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );
}
