// import {
//     BellIcon,
//     CheckCircle2Icon,
//     InfoIcon,
//     AlertTriangleIcon,
//   } from 'lucide-react';
//   import { Button } from '@/components/ui/button';
//   import { useState } from 'react';
  
//   type NotificationType = 'success' | 'info' | 'warning';
  
//   interface Notification {
//     id: number;
//     type: NotificationType;
//     title: string;
//     message: string;
//     time: string;
//   }
  
//   const iconMap: Record<NotificationType, JSX.Element> = {
//     success: <CheckCircle2Icon className="text-green-400" />,
//     info: <InfoIcon className="text-blue-400" />,
//     warning: <AlertTriangleIcon className="text-yellow-400" />,
//   };
  
//   const typeColors: Record<NotificationType, string> = {
//     success: 'border-green-500/30 bg-green-500/5',
//     info: 'border-blue-500/30 bg-blue-500/5',
//     warning: 'border-yellow-500/30 bg-yellow-500/5',
//   };
  
//   // Simulate 25 notifications
//   const allNotifications: Notification[] = Array.from({ length: 25 }, (_, i) => {
//     const type = ['success', 'info', 'warning'][i % 3] as NotificationType;
//     return {
//       id: i + 1,
//       type,
//       title: `Notification ${i + 1}`,
//       message: `This is the message for notification ${i + 1}.`,
//       time: `${i + 1} mins ago`,
//     };
//   });
  
//   const ITEMS_PER_PAGE = 10;
  
//   export default function NotificationsPage() {
//     const [page, setPage] = useState(1);
//     const totalPages = Math.ceil(allNotifications.length / ITEMS_PER_PAGE);
  
//     const startIndex = (page - 1) * ITEMS_PER_PAGE;
//     const visibleNotifications = allNotifications.slice(
//       startIndex,
//       startIndex + ITEMS_PER_PAGE
//     );
  
//     const handlePrev = () => setPage((p) => Math.max(1, p - 1));
//     const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  
//     return (
//       <div className="bg-[#121212] min-h-screen px-4 mb-9 flex flex-col items-center">
//         <div className="max-w-2xl w-full space-y-6">
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-bold text-white font-rajdhani flex items-center gap-2">
//               <BellIcon className="h-7 w-7 text-purple-400" />
//               Notifications
//             </h1>
//             <Button
//               variant="outline"
//               className="text-white border-white/20 hover:bg-white/10"
//             >
//               Mark all as read
//             </Button>
//           </div>
  
//           <div className="space-y-4">
//             {visibleNotifications.map((n) => (
//               <div
//                 key={n.id}
//                 className={`rounded-xl border p-4 flex items-start gap-4 shadow-md backdrop-blur-lg ${typeColors[n.type]}`}
//               >
//                 <div className="p-2 rounded-full bg-white/10">
//                   {iconMap[n.type]}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-white font-semibold">{n.title}</h3>
//                   <p className="text-gray-300 text-sm">{n.message}</p>
//                 </div>
//                 <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
//                   {n.time}
//                 </span>
//               </div>
//             ))}
//           </div>
  
//           {/* Pagination Controls */}
//           <div className="flex items-center justify-between pt-6">
//             <Button
//               onClick={handlePrev}
//               disabled={page === 1}
//               variant="outline"
//               className="text-white border-white/20 hover:bg-white/10 disabled:opacity-30"
//             >
//               Previous
//             </Button>
//             <span className="text-white font-medium">
//               Page {page} of {totalPages}
//             </span>
//             <Button
//               onClick={handleNext}
//               disabled={page === totalPages}
//               variant="outline"
//               className="text-white border-white/20 hover:bg-white/10 disabled:opacity-30"
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }


import {
  BellIcon,
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type NotificationType = 'success' | 'info' | 'warning';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
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

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="bg-[#121212] min-h-screen px-4 mb-9 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white font-rajdhani flex items-center gap-2">
            <BellIcon className="h-7 w-7 text-purple-400" />
            Notifications
          </h1>
          <Button
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => {
              // Optionally mark all as read here
            }}
          >
            Mark all as read
          </Button>
        </div>

        {loading ? (
          <p className="text-white text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-white text-center">No notifications found.</p>
        ) : (
          <>
            <div className="space-y-4">
              {visibleNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 flex items-start gap-4 shadow-md backdrop-blur-lg ${typeColors[n.type]}`}
                >
                  <div className="p-2 rounded-full bg-white/10">
                    {iconMap[n.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{n.title}</h3>
                    <p className="text-gray-300 text-sm">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                    {formatTime(n.created_at)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                onClick={handlePrev}
                disabled={page === 1}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 disabled:opacity-30"
              >
                Previous
              </Button>
              <span className="text-white font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={handleNext}
                disabled={page === totalPages}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 disabled:opacity-30"
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

  