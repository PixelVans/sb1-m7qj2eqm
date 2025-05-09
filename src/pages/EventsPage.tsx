import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon, Search, CalendarDays, LayoutGrid, Calendar as CalendarIcon, Clock, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isTomorrow, isSameDay } from 'date-fns';
import { useSettings } from '@/lib/store';
import { PricingModal } from '@/components/PricingModal';
import { toast } from 'sonner';
import { Confetti } from '@/components/Confetti';


type Event = Database['public']['Tables']['events']['Row'] & {
  start_time?: string;
  end_time?: string;
  location?: string;
};

type ViewMode = 'grid' | 'calendar';
type EventFilter = 'active' | 'ended' | 'all';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<EventFilter>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date(),
    startTime: '20:00',
    endTime: '23:00',
    location: '',
  });
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);

  const { subscription, theme, incrementEventsCreated, canCreateEvent } = useSettings();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (user?.id) {
      loadEvents();
      const tutorialSeen = localStorage.getItem('eventsTutorialSeen');
      setShowTutorial(!tutorialSeen);
    }
  }, [user?.id]);

  async function loadEvents() {
    if (!user?.id) return;

    setLoading(true);

    try {
      // Get all events regardless of status
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('dj_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('EVENT_LIMIT_REACHED')) {
          setShowUpgradeModal(true);
          toast.error('Event limit reached', {
            description: 'Please upgrade your plan to create more events.'
          });
          return;
        }
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.name.trim() || !user?.id) return;

    // Check if user can create an event before making the request
    if (!canCreateEvent()) {
      setShowEventModal(false);
      setShowUpgradeModal(true);
      toast.error('Event creation limit reached', {
        description: 'Please upgrade your plan to create more events.',
      });
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        name: newEvent.name.trim(),
        dj_id: user.id,
        created_at: newEvent.date.toISOString(),
        start_time: newEvent.startTime || null,
        end_time: newEvent.endTime || null,
        location: newEvent.location?.trim() || null,
        active: true,
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) {
        if (error.message.includes('EVENT_LIMIT_REACHED')) {
          setShowEventModal(false);
          setShowUpgradeModal(true);
          toast.error('Event creation limit reached', {
            description: 'Please upgrade your plan to create more events.',
          });
          return;
        }
        throw error;
      }

      incrementEventsCreated();
      setNewEvent({
        name: '',
        date: new Date(),
        startTime: '20:00',
        endTime: '23:00',
        location: '',
      });
      setShowEventModal(false);
      
      // Show success message and confetti
      toast.success('Event created successfully!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      
      await loadEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleEventStatus(event: Event) {
    if (updatingEventId) return; // Prevent multiple simultaneous updates
    setUpdatingEventId(event.id);

    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          active: !event.active
        })
        .eq('id', event.id);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, active: !e.active } : e
      ));

      toast.success(
        event.active ? 'Event ended successfully' : 'Event reactivated successfully'
      );
    } catch (error) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to update event status');
    } finally {
      setUpdatingEventId(null);
    }
  }

  const handleNewEvent = () => {
    if (!canCreateEvent()) {
      setShowUpgradeModal(true);
      toast.error('Event creation limit reached', {
        description: 'Please upgrade your plan to create more events.',
      });
      return;
    }
    setShowEventModal(true);
  };

  const dismissTutorial = () => {
    localStorage.setItem('eventsTutorialSeen', 'true');
    setShowTutorial(false);
  };

  // Calculate event counts
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.active).length;
  const endedEvents = events.filter(e => !e.active).length;

  // Filter events based on search query and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && event.active) || 
      (filter === 'ended' && !event.active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className={`${theme === 'dark' ? '   ' : ' bg-slate-100 px-9 py-4 rounded-xl  '} `}>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-gray-400 mt-1">Manage your events and track song requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
            className="relative group"
          >
            {viewMode === 'grid' ? (
              <CalendarIcon className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={handleNewEvent}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
          onClick={() => setFilter('all')}
        >
          <div className={`flex items-center gap-3 ${theme === 'dark' ? '   ' : ' bg-slate-200 px-9 py-4 rounded-xl  '} `}>
            <CalendarDays className="h-5 w-5" />
            <div >
              <p className="text-sm">All Events</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
          </div>
        </div>
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            filter === 'active' 
              ? 'bg-green-600 text-white' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
          onClick={() => setFilter('active')}
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5" />
            <div>
              <p className="text-sm">Active Events</p>
              <p className="text-2xl font-bold">{activeEvents}</p>
            </div>
          </div>
        </div>
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            filter === 'ended' 
              ? 'bg-gray-600 text-white' 
              : 'bg-white/5 hover:bg-white/10'
          } ${theme === 'dark' ? '   ' : ' bg-slate-100 px-9 py-4 rounded-xl  '}` }
          onClick={() => setFilter('ended')}
        >
          <div className={`flex items-center gap-3`}>
            <CalendarDays className="h-5 w-5" />
            <div >
              <p className="text-sm">Ended Events</p>
              <p className="text-2xl font-bold">{endedEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by name..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-lg">
            <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400">
              {events.length === 0
                ? "You haven't created any events yet"
                : filter === 'active'
                ? "You don't have any active events"
                : filter === 'ended'
                ? "You don't have any ended events"
                : "No events match your search"}
            </p>
            {events.length === 0 && (
              <Button
                onClick={handleNewEvent}
                variant="outline"
                className="mt-4"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className={`rounded-lg p-6 space-y-4 cursor-pointer transition-all transform hover:scale-[1.02]
                 hover:bg-white/10${theme === 'dark' ? ' bg-white/5  ' : ' bg-slate-100'} `}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div>
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-400">
                  {format(new Date(event.created_at), 'MMMM d, yyyy')}
                </p>
                {(event.start_time || event.location) && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    {event.start_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a')}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-sm ${
                  event.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {event.active ? 'Active' : 'Ended'}
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEventStatus(event);
                  }}
                  variant="secondary"
                  className="text-sm"
                  disabled={loading || updatingEventId === event.id}
                >
                  {updatingEventId === event.id ? '...' : (event.active ? 'End Event' : 'Reactivate')}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={createEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter event name"
                  autoFocus
                />
              </div>

              <div>
      <label className="block text-sm font-medium mb-2">
        Date
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(newEvent.date, 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={newEvent.date}
            onSelect={(date) => {
              if (date) {
                setNewEvent({ ...newEvent, date });
                setOpen(false); // 👈 Close the popover
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add location (optional)"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEventModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PricingModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        showFreePlan={false}
      />
    </div>
  );
}