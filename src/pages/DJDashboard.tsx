import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useSettings } from '@/lib/store';
import { TotalRequestsDialog } from '@/components/TotalRequestsDialog';


type Event = Database['public']['Tables']['events']['Row'];
type SongRequest = Database['public']['Tables']['song_requests']['Row'] & {
  events?: { name: string; dj_id: string };
};

type Stats = {
  activeEvents: number;
  totalRequests: number;
  topRequestsAllDJs: SongRequest[];
  topRequestsMyDJ: SongRequest[];
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
  const { theme, hasSeenTutorial, setHasSeenTutorial } = useSettings();

  const [stats, setStats] = useState<Stats>({
    activeEvents: 0,
    totalRequests: 0,
    topRequestsAllDJs: [],
    topRequestsMyDJ: [],
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [requestsByEvent, setRequestsByEvent] = useState<RequestsByEvent[]>([]);
  const djName = user?.user_metadata?.dj_name || 'DJ';
  const [activeStep, setActiveStep] = useState(0);
  const shouldShowTutorial = !hasSeenTutorial && !loading && recentEvents.length === 0;

 
  
  
  

  useEffect(() => {
    if (!user?.id) return;
  
    loadDashboardData(); 
  
    // Subscribe to all song_requests changes
    const subscription = supabase
      .channel('public:song_requests')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'song_requests',
        },
        () => {
         loadDashboardData();
        }
      )
      .subscribe();
  
    // Cleanup
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);
  
  

  async function loadDashboardData() {
   // setLoading(true);
    try {
      const { data: activeEvents } = await supabase
        .from('events')
        .select('id')
        .eq('dj_id', user!.id)
        .eq('active', true);

      const { data: events } = await supabase
        .from('events')
        .select('id,name,created_at,active,dj_id,start_time,end_time,location,song_requests(count)')
        .eq('dj_id', user!.id)
        .order('created_at', { ascending: false });

      const totalRequests =
        events?.reduce(
          (sum, ev) => sum + (ev.song_requests?.[0]?.count || 0),
          0
        ) || 0;

      const breakdown =
        events?.map(ev => ({
          event_name: ev.name,
          event_date: ev.created_at,
          total_requests: ev.song_requests?.[0]?.count || 0,
          active: ev.active,
        })) || [];

      const { data: topAll } = await supabase
        .from('song_requests')
        .select('*, events!inner(name)')
        .order('votes', { ascending: false })
        .limit(5);

      const { data: topMy } = await supabase
        .from('song_requests')
        .select('*, events!inner(name,dj_id)')
        .eq('events.dj_id', user!.id)
        .order('votes', { ascending: false })
        .limit(5);

      setStats({
        activeEvents: activeEvents?.length || 0,
        totalRequests,
        topRequestsAllDJs: topAll || [],
        topRequestsMyDJ: topMy || [],
      });

      setRequestsByEvent(breakdown);
      setRecentEvents((events as any as Event[]));

      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" />
      </div>
    );
  }


  const steps = [
    {
      title: 'Create an Event',
      desc: 'Start by creating a new event for your upcoming gig.',
    },
    {
      title: 'Share the QR Code ',
      desc: 'Display the event QR code for attendees to scan and request songs or share the  link',
    },
    {
      title: 'Manage Requests',
      desc: 'View and manage song requests during your event.',
    },
    {
      title: 'Top requests',
      desc: 'View your top song requests from your events and discover popular tracks from other DJs — all in your dashboard.',
    },
  ];
  
  return (
    <div className="space-y-8">
      

      {/* Welcome */}
      <div
        className={`relative rounded-lg p-8 overflow-hidden onboarding-welcome ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-600/20 to-blue-500/20 shadow-black shadow-sm '
            : 'bg-white shadow-lg'
        }`}
      >
        
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4 leading-tight">
          Welcome onboard,&nbsp;
          {djName.split('').map((ch: any, i: any) => (
            <span
              key={i}
              data-aos="zoom-in"
              data-aos-delay={i * 100}
              data-aos-once
              className={theme === 'dark' ? 'text-yellow-300' : 'text-purple-700'}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className={ theme === 'dark' ? 'text-gray-300   italic ' : 'text-gray-800 '}>
          Manage your events and song requests from one place.
        </p>
      </div>

      {/* Getting Started Manual (fallback visual) */}
      {shouldShowTutorial &&  (
  <div className="bg-white/5 rounded-lg p-6 onboarding-create-event">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Getting Started</h2>
      <button
        onClick={() => {
          setHasSeenTutorial(true);
        }}
        className="text-sm text-yellow-100  hover:rounded-xl p-2 hover:underline hover:shadow-lg hover:shadow-purple-600"
      >
        Dismiss tutorial
      </button>
    </div>

    {/* Step Selector */}
    <div className="flex gap-2 mb-6">
      {steps.map((_, idx) => (
        <button
          key={idx}
          onClick={() => setActiveStep(idx)}
          className={`px-3 py-1 rounded-full border text-sm ${
            activeStep === idx
              ? 'bg-purple-500 text-white'
              : 'bg-transparent text-gray-300 border-gray-500'
          }`}
        >
          Step {idx + 1}
        </button>
      ))}
    </div>

    {/* Active Step Content */}
    <div className="p-4 rounded-lg bg-white/10">
      <h3 className="text-lg font-medium text-white mb-1">
        {steps[activeStep].title}
      </h3>
      <p className="text-gray-300">{steps[activeStep].desc}</p>
    </div>
      </div>
    )}


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate('/events?filter=active')}
          className={`rounded-lg p-6 flex justify-between items-center  cursor-pointer onboarding-create-event ${
            theme === 'dark' ? 'bg-white/5 shadow-black shadow-md' : 'bg-white shadow-lg'
          } hover:bg-white/10 transition`}
        >
          <div >
            <CalendarDays className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="text-2xl font-bold">{stats.activeEvents}</h3>
            <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}>
              Active Events
            </p>
          </div>
        </div>

        <div
          onClick={() => setShowRequestsDialog(true)}
          className={`rounded-lg p-6 flex justify-between  items-center cursor-pointer onboarding-requests ${
            theme === 'dark' ? 'bg-white/5 shadow-black shadow-md' : 'bg-white shadow-lg'
          } hover:bg-white/10 transition`}
        >
          <div>
            <Music2 className="h-6 w-6 text-purple-500 mb-2 font-bold " />
            <h3 className="text-2xl font-bold">{stats.totalRequests}</h3>
            <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}>
              Total Requests
            </p>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div
          className={`rounded-lg p-6 onboarding-recent-events ${
            theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Events</h2>
            <Button variant="ghost" onClick={() => navigate('/events')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentEvents.map(ev => (
              <div
                key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className={`flex justify-between items-center p-4 rounded-lg cursor-pointer hover:bg-white/10 transition ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div>
                  <h3 className={theme === 'dark' ? 'text-white' : undefined}>
                    {ev.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    ev.active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {ev.active ? 'Active' : 'Ended'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}


          {/* Your Top Requests */}
          <div
        className={`rounded-lg p-6  ${
          theme === 'dark' ? 'bg-white/5 shadow-black shadow-sm' : 'bg-white shadow-lg'
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Top Requests From All Your Events</h2>
        <div className="space-y-3">
          {stats.topRequestsMyDJ.length === 0 ? (
            <p className="text-center text-gray-400">No requests yet.</p>
          ) : (
            stats.topRequestsMyDJ.map((req, i) => (
              <div
                key={req.id}
                className={`flex justify-between items-center p-4 rounded-lg hover:bg-white/10 transition ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">#{i + 1}</span>
                  <div>
                    <p className={theme === 'dark' ? 'text-white' : undefined}>
                      {req.title}
                    </p>
                    <p className="text-sm text-gray-400">{req.events!.name}</p>
                  </div>
                </div>
                <span className="font-medium">{req.votes} votes</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Requests */}
      <div
        className={`rounded-lg p-6 onboarding-top-requests ${
          theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-lg'
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Trending Requests on the Platform</h2>
        <div className="space-y-3">
          {stats.topRequestsAllDJs.length === 0 ? (
            <p className="text-center text-gray-400">No requests yet.</p>
          ) : (
            stats.topRequestsAllDJs.map((req, i) => (
              <div
                key={req.id}
                className={`flex justify-between items-center p-4 rounded-lg hover:bg-white/10 transition ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">#{i + 1}</span>
                  <div>
                    <p className={theme === 'dark' ? 'text-white' : undefined}>
                      {req.title}
                    </p>
                    <p className="text-sm text-gray-400">{req.events!.name}</p>
                  </div>
                </div>
                <span className="font-medium">{req.votes} votes</span>
              </div>
            ))
          )}
        </div>
      </div>

  

      <TotalRequestsDialog
        open={showRequestsDialog}
        onOpenChange={setShowRequestsDialog}
        requestsByEvent={requestsByEvent}
      />
    </div>
  );
}



