import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, CalendarDaysIcon, SettingsIcon, BellIcon, Moon, Sun, RocketIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDialog } from '@/components/ProfileDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/store';
import { getLogoUrl } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { theme, setTheme, subscription } = useSettings();
  const [profileOpen, setProfileOpen] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const djName = user?.user_metadata?.dj_name || 'DJ';
  const logoUrl = getLogoUrl();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'} text-foreground flex`}>
      {/* Sidebar */}
      <div className={`w-64 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} p-6 flex flex-col gap-8 border-r border-border`}>
        <div className="flex items-center gap-2">
          <a href='/' className='flex gap-2'>
          <img src={logoUrl} alt="Hey DJ" className="h-8 w-8" />
          <span className="text-xl font-bold">Hey DJ</span></a>
        </div>
        
        <nav className="flex-1 flex flex-col">
          <div className="space-y-1">
            <NavLink to="/dashboard" icon={LayoutDashboardIcon}>
              Dashboard
            </NavLink>
            <NavLink to="/events" icon={CalendarDaysIcon}>
              Events
            </NavLink>
            <NavLink to="/settings" icon={SettingsIcon}>
              Settings
            </NavLink>
            
            {subscription.plan === 'free' && (
              <Link
                to="/pricing"
                className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI4MS4yNyUiIHkxPSI4MS4yNyUiIHgyPSIwJSIgeTI9IjAlIiBpZD0iYSI+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIuMDUiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <RocketIcon className="h-5 w-5 text-amber-900 relative z-10" />
                <div className="flex-1 relative z-10">
                  <span className="font-semibold block text-amber-900">Upgrade to Pro</span>
                  <span className="text-xs text-amber-900/80 block">Unlock unlimited events</span>
                </div>
                <SparklesIcon className="h-4 w-4 text-amber-900 absolute top-1 right-1 animate-[pulse_3s_ease-in-out_infinite] z-10" />
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-8">
          <div className="flex-1" />
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
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ConnectionStatus />
    </div>
  );
}

function NavLink({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) {
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