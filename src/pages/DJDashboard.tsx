import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Music2, Lock, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useSettings } from '@/lib/store';
import { TotalRequestsDialog } from '@/components/TotalRequestsDialog';
import { getAssetUrl } from '@/lib/utils';


type Event = Database['public']['Tables']['events']['Row'];
type SongRequest = Database['public']['Tables']['song_requests']['Row'] & {
  event_name?: string;
  request_count: number;
  status: 'pending' | 'played' | 'rejected';
  queue_position: number;
};

type Stats = {
  activeEvents: number;
  totalRequests: number;
  topRequests: SongRequest[];
};

type RequestsByEvent = {
  event_name: string;
  event_date: string;
  total_requests: number;
  active: boolean;
};

export default function DJDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSettings();
  const [stats, setStats] = useState<Stats>({
    activeEvents: 0,
    totalRequests: 0,
    topRequests: [],
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [requestsByEvent, setRequestsByEvent] = useState<RequestsByEvent[]>([]);
  const djName = user?.user_metadata?.dj_name || 'DJ';
  const { theme } = useSettings();
  const soundwaveImg = getAssetUrl('soundwave.png');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  async function loadDashboardData() {
    if (!user?.id) return;

    try {
      // Get active events count
      const { data: activeEvents } = await supabase
        .from('events')
        .select('id')
        .eq('dj_id', user.id)
        .eq('active', true);

      // Get total requests count and breakdown by event
      const { data: events } = await supabase
        .from('events')
        .select(
          `
          id,
          name,
          created_at,
          active,
          dj_id,
          start_time,
          end_time,
          location,
          song_requests (count)
        `
        )
        .eq('dj_id', user.id)
        .order('created_at', { ascending: false });

      const totalRequests =
        events?.reduce(
          (sum, event) => sum + (event.song_requests?.[0]?.count || 0),
          0
        ) || 0;

      const requestsBreakdown =
        events?.map((event) => ({
          event_name: event.name,
          event_date: event.created_at,
          total_requests: event.song_requests?.[0]?.count || 0,
          active: event.active,
        })) || [];

      // Get top requests only for pro users
      let topRequests: SongRequest[] = [];
      if (subscription.plan === 'pro') {
        const { data: topRequestsData } = await supabase
          .from('song_requests')
          .select(
            `
            *,
            events!inner (
              name
            )
          `
          )
          .order('votes', { ascending: false })
          .limit(5);

        topRequests =
          topRequestsData?.map((request) => ({
            ...request,
            event_name: request.events.name,
          })) || [];
      }

      setStats({
        activeEvents: activeEvents?.length || 0,
        totalRequests,
        topRequests,
      });

      setRequestsByEvent(requestsBreakdown);
      setRecentEvents(events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  }
  type Stat = {
    label: string;
    value: string;
    icon: any;
    color: string;
    onClick?: () => void;
  };
  const stats_data: Stat[] = [
    {
      label: 'Active Events',
      value: stats.activeEvents.toString(),
      icon: CalendarDays,
      color: 'bg-purple-500/20 text-purple-300',
      onClick: () => navigate('/events?filter=active'),
    },
    {
      label: 'Total Requests',
      value: stats.totalRequests.toString(),
      icon: Music2,
      
      color: 'bg-blue-500/20 text-blue-300',
      onClick: () => setShowRequestsDialog(true),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`relative  rounded-lg p-8 overflow-hidden  
      ${theme === 'dark' ? ' bg-gradient-to-r from-purple-500/20 to-blue-500/20  ' : 'bg-white shadow-lg  '} `}>
        
        {/* Absolute image on the right */}
        <img
          src={soundwaveImg}
          alt="Soundwave"
          className="absolute right-0 top-0 h-full object-contain pointer-events-none opacity-80"
        />

        <h1 className="text-3xl font-extralight mb-2 font-audiowide relative z-10">
          Welcome onboard, <span className={`${theme === 'dark' ? 'text-yellow-300 ' : 'text-purple-700 '} `}>{djName}!</span>
        </h1>

        
        <p className={`relative z-10 ${theme === 'dark' ? ' text-gray-300  ' : ' text-gray-700   '} `}>
          Manage your events and song requests from one place.
        </p>
      </div>


      {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {stats_data.map((stat) => (
          <div
            key={stat.label}
            className={` rounded-lg p-6 ${
              stat.onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''
              } flex justify-between items-center ${theme === 'dark' ? ' bg-white/5 ' : 'bg-white shadow-lg '} `}
            onClick={stat.onClick}
          >
            {/* Left side: icon + text */}
            <div>
              <div className={`inline-flex p-3 rounded-lg  mb-4 ${theme === 'dark' ? `${stat.color} ` : ' text-primary'} `}>
                
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className={`${theme === 'dark' && ' text-gray-200'} `}>{stat.label}</p>
            </div>

            
          </div>
        ))}
      </div>


      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div data-aos="zoom-in" className={` rounded-lg p-6 ${theme === 'dark' ? 'bg-white/5  ' : ' bg-white shadow-lg '} `} >
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Events</h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => navigate('/events')}
            >
              View All
              <CalendarDays className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div>
                  <h3 className={`font-medium ${theme === 'dark' &&' white ' } `}>{event.name}</h3>
                  <p  >
                 {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    event.active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`} 
                >
                  {event.active ? 'Active' : 'Ended'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Requests */}
      <div className={`rounded-lg p-6 ${theme === 'dark' ? ' bg-white/5  ' : ' bg-white shadow-lg'} `}>
      
        <div className="flex items-center gap-2 mb-6">
          <Music2 className="h-5 w-5 text-blue-300" />
          <h2 className="text-xl font-bold">Top Requests</h2>
          {subscription.plan === 'free' && (
            <div className="ml-auto flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-400">Pro feature</span>
            </div>
          )}
        </div>

        {subscription.plan === 'free' ? (
          <div className="relative">
            {/* Blurred preview */}
            <div className="filter blur-sm opacity-50">
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary/50">
                        #{index}
                      </span>
                      <div>
                        <h3 className="font-medium text-white">
                          Popular Song Title
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Artist Name</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music2 className="h-4 w-4 text-blue-300" />
                      <span className="font-medium">XX votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black gap-2"
              >
                <SparklesIcon className="h-4 w-4" />
                Upgrade to See Top Songs
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.topRequests.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                No song requests yet
              </p>
            ) : (
              stats.topRequests.map((request, index) => (
                <div
                  key={request.id}
                  className={`flex items-center justify-between p-4  rounded-lg ${theme === 'dark' ? '  bg-white/5 ' : ' bg-white shadow-lg   '} `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary/50">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' && ' text-white'} `} >
                        {request.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`${theme === 'dark' && ' text-gray-400'} `} >{request.artist}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">
                          {request.event_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-blue-300" />
                    <span className="font-medium">{request.votes} votes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Getting Started */}
      {recentEvents.length === 0 && (
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                1
              </div>
              <div>
                <h3 className="font-medium text-white">Create an Event</h3>
                <p className="text-gray-400">
                  Start by creating a new event for your upcoming gig.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                2
              </div>
              <div>
                <h3 className="font-medium text-white">Share the QR Code</h3>
                <p className="text-gray-400">
                  Display the event QR code for attendees to scan and request
                  songs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                3
              </div>
              <div>
                <h3 className="font-medium text-white">Manage Requests</h3>
                <p className="text-gray-400">
                  View and manage song requests during your event.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <TotalRequestsDialog
        open={showRequestsDialog}
        onOpenChange={setShowRequestsDialog}
        requestsByEvent={requestsByEvent}
      />
    </div>
  );
}
