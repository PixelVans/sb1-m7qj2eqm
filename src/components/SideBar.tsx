// components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, CalendarDaysIcon, SettingsIcon,
  RocketIcon, SparklesIcon, HeadsetIcon
} from 'lucide-react';
import { getAssetUrl, getLogoUrl } from '@/lib/utils';
import { useSettings } from '@/lib/store';

interface SidebarProps {
  subscription: any;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ subscription, onClose, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const logoUrl = getLogoUrl();
  const dj = getAssetUrl('djr.png');
const { theme,  } = useSettings(); 
    
  const NavLink = ({ to, icon: Icon, children }: any) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        onClick={onClose}
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
  };

  return (
    <div
        className={`w-64 ${
          theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
        } p-6 flex flex-col gap-8 border-r border-border min-h-full`}
      >
        <div className="flex items-center gap-2">
          <a href="/" className="flex gap-2">
            <img src={logoUrl} alt="Hey DJ" className="h-8 w-8" />
            <span className="text-xl font-bold font-audiowide">Hey Dj</span>
          </a>
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
            <NavLink to="/contact" icon={HeadsetIcon}>
              Contact
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
                  <span className="font-semibold block text-amber-900 mt-2">
                    Upgrade to Pro
                  </span>
                  <span className="text-xs text-amber-900/80 block">
                    Unlock unlimited events
                  </span>
                </div>
                <SparklesIcon className="h-4 w-4 text-amber-900 absolute top-1 right-1 animate-[pulse_3s_ease-in-out_infinite] z-10" />
              </Link>
            )}
          </div>

          <div className="mt-[50px] sm:mt-[100px] ">
            <img src={dj} alt="" className="animate-bump" />
          </div>
          <h1 className="font-zenspot text-center font-extralight text-purple-300 mt-4">
            Que it up
          </h1>
        </nav>
      </div>
  );
}






















