// components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon, CalendarDaysIcon, SettingsIcon,
  RocketIcon, SparklesIcon, HeadsetIcon
} from 'lucide-react';
import {  getLogoUrl } from '@/lib/utils';
import { useSettings } from '@/lib/store';

interface SidebarProps {
  subscription: any;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ subscription, onClose, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const logoUrl = getLogoUrl();
 // const dj = getAssetUrl('djr.png');
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
  if (!subscription || typeof subscription.plan !== 'string' || subscription.plan === null) {
    return null;
  }
  return (
    <div
        className={`w-64 ${
          theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white shadow-lg '
        } p-4 md:p-6 flex flex-col gap-8 border-r border-border min-h-full`}
      >
        <div className="flex items-center gap-2">
          <a href="/" className="flex gap-2">
            <img src={logoUrl} alt="Hey DJ" className="h-8 w-8" />
            <span className="text-2xl font-bold font-rajdhani">Hey Dj</span>
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
            
          
          </div>
       </nav>
      </div>
  );
}






















