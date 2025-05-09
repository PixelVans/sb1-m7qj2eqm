import {
  BellIcon,
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
  Loader2,
  CheckIcon,
  CheckCheckIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/store';

type NotificationType = 'success' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

const iconMap: Record<NotificationType, JSX.Element> = {
  success: <CheckCircle2Icon className="text-green-400" />,
  info: <InfoIcon className="text-blue-400" />,
  warning: <AlertTriangleIcon className="text-yellow-400" />,
};

const typeColors: Record<NotificationType, string> = {
  success: 'border-green-500/30 bg-green-500/5',
  info: 'border-blue-500/30 bg-blue-500/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
};

const ITEMS_PER_PAGE = 10;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const visibleNotifications = notifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error.message);
      } else {
        setNotifications(data as Notification[]);
      }

      setLoading(false);
    }

    fetchNotifications();
  }, [user?.id]);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user?.id)
      .eq('read', false);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } else {
      console.error('Failed to mark all as read:', error.message);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="px-1 sm:px-4 py-4 sm:py-6 mb-9 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-row sm:items-center justify-between gap-2">
          <h1 className={`text-2xl sm:text-3xl font-bold font-rajdhani flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BellIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className="text-md sm:text-2xl">Notifications</span>
          </h1>

          {notifications.some((n) => !n.read) && (
            <div className="relative group">
              <button
                onClick={handleMarkAllAsRead}
                className={`p-2 rounded-lg ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
              >
                <CheckCheckIcon className="h-4 w-4" />
              </button>
              <div className={`absolute -top-8 right-0 rounded px-2 py-1 text-xs shadow z-10 w-max transition-opacity duration-200
                ${isDark ? 'bg-white text-black' : 'bg-black text-white'} opacity-0 group-hover:opacity-100`}>
                Mark all as read
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className={`flex justify-center items-center space-x-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            <Loader2 className="animate-spin h-9 w-9" />
            <span className={`${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>Fetching...</span>
          </div>
        ) : notifications.length === 0 ? (
          <p className={`${isDark ? 'text-white' : 'text-gray-700'} text-center`}>No notifications found.</p>
        ) : (
          <>
            <div className="space-y-4">
              {visibleNotifications.map((n) => (
                <div key={n.id} className={`${isDark ? 'border-white/15' : 'border-gray-300'} border-b pb-4`}>
                  <div
                    className={`rounded-xl p-2 sm:p-4 flex flex-col sm:flex-row 
                      sm:items-start sm:justify-between gap-4 backdrop-blur-lg transition-opacity ${
                        typeColors[n.type]
                      } ${n.read ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="flex gap-2 sm:gap-3 items-start">
                      <div className={`p-1 sm:p-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-300'} shrink-0`}>
                        {iconMap[n.type]}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${n.read
                          ? (isDark ? 'text-gray-50' : 'text-gray-700')
                          : (isDark ? 'text-white' : 'text-black')}`}>
                          {n.title}
                        </h3>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{n.message}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between sm:flex-col sm:items-end gap-2">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-xs whitespace-nowrap`}>
                        {formatTime(n.created_at)}
                      </span>
                      {n.read ? (
                        <span className={`text-sm  ${isDark ? 'text-green-300' : 'text-green-600'} mr-1`}>
                          Read
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`${isDark ? 'text-yellow-200 hover:bg-white/10' : 'text-yellow-800 hover:bg-yellow-300'} p-2`}
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
              <Button
                onClick={handlePrev}
                disabled={page === 1}
                variant="outline"
                className={`w-full sm:w-auto border ${isDark
                  ? 'text-white border-white/20 hover:bg-white/10'
                  : 'text-gray-800 border-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
              >
                Previous
              </Button>
              <span className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium`}>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={handleNext}
                disabled={page === totalPages}
                variant="outline"
                className={`w-full sm:w-auto border ${isDark
                  ? 'text-white border-white/20 hover:bg-white/10'
                  : 'text-gray-800 border-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
