import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ExternalLink, Music2, Instagram, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebounce'; 



import { useSettings } from '@/lib/store';

type Event = Database['public']['Tables']['events']['Row'] & {
  dj_profile?: {
    dj_name: string;
    avatar_url: string | null;
    bio: string | null;
    social_links: {
      instagram?: string;
    } | null;
  };
};

type SongRequest = Database['public']['Tables']['song_requests']['Row'];

const MAX_TITLE_LENGTH = 100;
const MAX_ARTIST_LENGTH = 100;
const VOTE_DEBOUNCE_MS = 500;

export default function AttendeeView() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songLink, setSongLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userRequests, setUserRequests] = useState<number>(0);
  const { requestLimit } = useSettings();
  

  const [votedSongIds, setVotedSongIds] = useState<string[]>([]);

  // Load voted songs on mount
  useEffect(() => {
    const storedVotes = localStorage.getItem(`voted_${eventId}`);
    if (storedVotes) {
      setVotedSongIds(JSON.parse(storedVotes));
    }
  }, [eventId]);
  
  // Update local storage when votes change
  function updateVoted(songId: string, voted: boolean) {
    const updated = voted
      ? [...votedSongIds, songId]
      : votedSongIds.filter((id) => id !== songId);
  
    setVotedSongIds(updated);
    localStorage.setItem(`voted_${eventId}`, JSON.stringify(updated));
  }
  




  // Debounce vote updates to prevent spam
  const debouncedVoteUpdate = useDebouncedCallback(handleVoteToggle, VOTE_DEBOUNCE_MS);

  

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
      loadSongRequests();
      loadUserRequests();

      const subscription = supabase
        .channel('song_requests_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'song_requests',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            loadSongRequests();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [eventId]);

  async function loadEventDetails() {
    if (!eventId) return;
    
    try {
      // First get the event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) throw new Error('Event not found');

      // Check if event is active
      if (!eventData.active) {
        throw new Error('This event has ended');
      }

      // Then get the DJ profile using the RPC function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_dj_profile', { event_id: eventId })
        .maybeSingle();

      if (profileError) throw profileError;

      // Combine event and profile data
      setEvent({
        ...eventData,
        dj_profile: profileData
      });
      setError(null);
    } catch (error: any) {
      console.error('Error loading event:', error);
      setError(
        error.message === 'Event not found'
          ? 'This event does not exist or has been removed.'
          : error.message === 'This event has ended'
          ? 'This event has ended. No more requests can be made.'
          : 'Unable to load event details. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSongRequests() {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('event_id', eventId)
        .order('votes', { ascending: false });

      if (error) throw error;

      setSongRequests(data || []);
    } catch (error) {
      console.error('Error loading song requests:', error);
      toast.error('Failed to load song requests');
    }
  }

  async function loadUserRequests() {
    if (!eventId) return;
    
    // Get request count from localStorage
    const count = localStorage.getItem(`requests_${eventId}`) || '0';
    setUserRequests(parseInt(count, 10));
  }

  function validateSongLink(link: string): boolean {
    if (!link) return true;
    try {
      const url = new URL(link);
      return ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com'].some(
        domain => url.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId || !songTitle.trim() || !artist.trim()) return;
    if (userRequests >= requestLimit) {
      toast.error('Request limit reached', {
        description: `You can only make ${requestLimit} requests for this event.`
      });
      return;
    }

    // Validate inputs
    if (songTitle.length > MAX_TITLE_LENGTH) {
      toast.error('Song title is too long');
      return;
    }
    if (artist.length > MAX_ARTIST_LENGTH) {
      toast.error('Artist name is too long');
      return;
    }
    if (songLink && !validateSongLink(songLink)) {
      toast.error('Invalid song link', {
        description: 'Please provide a valid YouTube, Spotify, or SoundCloud link'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check if song already exists
      const { data: existingSongs } = await supabase
        .from('song_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('title', songTitle.trim())
        .eq('artist', artist.trim());

      if (existingSongs && existingSongs.length > 0) {
        // Update votes for existing song
        await supabase
          .from('song_requests')
          .update({ votes: existingSongs[0].votes + 1 })
          .eq('id', existingSongs[0].id);

        toast.success('Vote added to existing song request!');
      } else {
        // Create new song request
        await supabase
          .from('song_requests')
          .insert([
            {
              event_id: eventId,
              title: songTitle.trim(),
              artist: artist.trim(),
              song_link: songLink.trim() || null,
              votes: 1,
            },
          ]);

        // Update local request count
        const newCount = userRequests + 1;
        localStorage.setItem(`requests_${eventId}`, newCount.toString());
        setUserRequests(newCount);

        toast.success('Song request submitted successfully!');
      }

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Clear form
      setSongTitle('');
      setArtist('');
      setSongLink('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit song request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoteToggle(songId: string) {
    if (!songId || !eventId) return;
  
    const votedSongsKey = `voted_${eventId}`;
    const votedSongs = JSON.parse(localStorage.getItem(votedSongsKey) || '[]') as string[];
    const hasVoted = votedSongs.includes(songId);
    const alreadyVoted = votedSongIds.includes(songId);
  
    try {
      const { data: song, error: fetchError } = await supabase
        .from('song_requests')
        .select('votes')
        .eq('id', songId)
        .single();
  
      if (fetchError) throw fetchError;
      if (!song) throw new Error('Song not found');
  
      const updatedVotes = hasVoted ? song.votes - 1 : song.votes + 1;
      updateVoted(songId, !alreadyVoted);

      const { error: updateError } = await supabase
        .from('song_requests')
        .update({ votes: updatedVotes })
        .eq('id', songId);
  
      if (updateError) throw updateError;
  
      // Update localStorage
      const newVotedSongs = hasVoted
        ? votedSongs.filter(id => id !== songId)
        : [...votedSongs, songId];
      localStorage.setItem(votedSongsKey, JSON.stringify(newVotedSongs));
  
      toast.success(hasVoted ? 'Vote removed' : 'Vote added');
    } catch (error) {
      console.error('Error toggling vote:', error);
      toast.error('Failed to update vote');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="text-center text-white space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-gray-400">{error || 'Unable to load event details.'}</p>
        </div>
      </div>
    );
  }

  const djName = event.dj_profile?.dj_name || 'DJ';
  const djAvatar = event.dj_profile?.avatar_url;
  const djBio = event.dj_profile?.bio;
  const instagramUrl = event.dj_profile?.social_links?.instagram;
  const remainingRequests = requestLimit - userRequests;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Event Header */}
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {djAvatar ? (
                <img
                  src={djAvatar}
                  alt={djName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-semibold bg-primary/20 text-primary">
                  {djName[0]}
                </div>
              )}
            </div>
            <span className="text-lg text-gray-300">{djName}</span>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
          {djBio && (
            <p className="text-gray-400 mt-3 max-w-md mx-auto">
              {djBio}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Request Form */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Request a Song</h2>
            <div className="text-sm text-gray-400">
              {remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="songTitle" className="block text-sm font-medium mb-2">
                Song Title *
              </label>
              <input
                id="songTitle"
                type="text"
                required
                maxLength={MAX_TITLE_LENGTH}
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter song title"
                disabled={remainingRequests === 0 || submitting}
              />
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-medium mb-2">
                Artist *
              </label>
              <input
                id="artist"
                type="text"
                required
                maxLength={MAX_ARTIST_LENGTH}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter artist name"
                disabled={remainingRequests === 0 || submitting}
              />
            </div>

            <div>
              <label htmlFor="songLink" className="block text-sm font-medium mb-2">
                Song Link (Optional)
              </label>
              <input
                id="songLink"
                type="url"
                value={songLink}
                onChange={(e) => setSongLink(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="YouTube, Spotify, or SoundCloud link"
                disabled={remainingRequests === 0 || submitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                Supported platforms: YouTube, Spotify, SoundCloud
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={remainingRequests === 0 || submitting}
            >
              {submitting ? 'Submitting...' : (
                remainingRequests === 0 ? 'Request Limit Reached' : 'Submit Request'
              )}
            </Button>

            {success && (
              <div className="mt-4 p-4 bg-green-500/20 text-green-300 rounded-lg text-center">
                Song request submitted successfully!
              </div>
            )}
          </form>
        </div>

        {/* Song Requests */}
        <div className="bg-white/5 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            Requested Songs
          </h2>
          <div className="space-y-3">
            {songRequests.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                No songs have been requested yet. Be the first!
              </p>
            ) : (
              songRequests.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-white">{song.title}</h3>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                    {song.song_link && (
                      <a
                        href={song.song_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Link
                      </a>
                    )}
                  </div>
                  <button
                        onClick={() => debouncedVoteUpdate(song.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                          votedSongIds.includes(song.id)
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-white/5 text-purple-300 hover:bg-white/10'
                                  }`}
                                  >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{song.votes}</span>
                  </button>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}