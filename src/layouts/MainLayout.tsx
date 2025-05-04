import React, { useState } from 'react';
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
import { sub } from 'date-fns';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { theme, setTheme, subscription } = useSettings();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const avatarUrl = user?.user_metadata?.avatar_url;
  const djName = user?.user_metadata?.dj_name || 'DJ';
  
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'
      } text-foreground flex`}
    >
      {/* Sidebar */}
    
       {/* Desktop Sidebar */}
       <div className="hidden lg:block">
        <Sidebar subscription={subscription} />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
          <>
            {/* Dark backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar overlays everything */}
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
        <div className="h-16 border-b border-border flex items-center  px-8  ">
           {/* Mobile hamburger */}
           <div className="lg:hidden mr-2">
            <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-accent rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex-1" />

          {/* subscription reminder */}
          <div className="relative overflow-hidden h-6 mr-9 w-full">
            <div className="text-md font-extralight font-rajdhani text-yellow-200">
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
            <button className="p-2 hover:bg-accent rounded-full">
              <BellIcon className="h-5 w-5 text-muted-foreground" />
            </button>
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
        <div className="flex-1 overflow-auto p-8">{children}</div>
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
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

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

























