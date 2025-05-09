import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, Download, QrCode, Share2, ChevronDown, ChevronUp, ExternalLink, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSettings } from '@/lib/store';

type Event = Database['public']['Tables']['events']['Row'];
type SongRequest = Database['public']['Tables']['song_requests']['Row'] & {
  request_count: number;
  status: 'pending' | 'played' | 'rejected';
  queue_position: number;
};

type QRSize = {
  label: string;
  size: number;
  dimensions: string;
};

const QR_SIZES: QRSize[] = [
  { label: 'Letter Size (8.5" x 11")', size: 1000, dimensions: '2550x3300' },
  { label: 'Half Page (5.5" x 8.5")', size: 800, dimensions: '1650x2550' },
  { label: 'Quarter Page (4.25" x 5.5")', size: 600, dimensions: '1275x1650' },
];

function SongRequestCard({ song, onStatusChange }: { 
  song: SongRequest; 
  onStatusChange: (id: string, status: 'pending' | 'played' | 'rejected') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { theme } = useSettings();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4  rounded-lg group${theme === 'dark' ? ' bg-white/5  ' : ' bg-slate-200   '} `}
    >
      {song.status === 'pending' && (
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <div className="flex-1 ">
        <div className="flex items-center gap-2">
          {song.status === 'pending' && (
            <span className="text-lg font-semibold text-purple-400">#{song.queue_position}</span>
          )}
          <h3 className={`font-medium ${theme === 'dark' ? ' text-white  ' : ' text-black  '} `}>{song.title}</h3>
          
        </div>
        <p className={`font-sm ${theme === 'dark' ? ' text-gray-400 ' : ' text-slate-900  '} `}>{song.artist}</p>
        
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
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <ThumbsUp className={`h-4 w-4 ${theme === 'dark' ? ' text-purple-300 ' : ' text-purple-800  '} `} />
          <span >{song.votes}</span>
          
          {song.request_count > 1 && (
            <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
              {song.request_count}x
            </span>
          )}
        </div>
        {song.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => onStatusChange(song.id, 'played')}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onStatusChange(song.id, 'rejected')}
              variant="destructive"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {song.status === 'played' && (
          <span className="text-green-400 flex items-center gap-1">
            <Check className="h-4 w-4" />
            Played
          </span>
        )}
        {song.status === 'rejected' && (
          <span className="text-red-400 flex items-center gap-1">
            <X className="h-4 w-4" />
            Rejected
          </span>
        )}
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<QRSize>(QR_SIZES[0]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const { theme } = useSettings();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
      loadSongRequests();

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
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        throw error;
      }

      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  }

  async function loadSongRequests() {
    try {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('event_id', eventId)
        .order('votes', { ascending: false });

      if (error) {
        throw error;
      }

      // Group requests by song and artist to combine duplicates
      const groupedRequests = data?.reduce((acc, request) => {
        const key = `${request.title}-${request.artist}`;
        if (!acc[key]) {
          acc[key] = {
            ...request,
            request_count: 1,
            status: request.played ? 'played' : (request.rejected ? 'rejected' : 'pending'),
            queue_position: 0,
          };
        } else {
          acc[key].request_count += 1;
          acc[key].votes += request.votes;
        }
        return acc;
      }, {} as Record<string, SongRequest>) || {};

      // Convert to array and sort by votes
      const sortedRequests = Object.values(groupedRequests).sort((a, b) => b.votes - a.votes);

      // Assign queue positions to pending songs
      let queuePosition = 1;
      sortedRequests.forEach(request => {
        if (request.status === 'pending') {
          request.queue_position = queuePosition++;
        }
      });

      setSongRequests(sortedRequests);
    } catch (error) {
      console.error('Error loading song requests:', error);
      toast.error('Failed to load song requests');
    }
  }

  async function handleStatusChange(songId: string, status: 'pending' | 'played' | 'rejected') {
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({ 
          played: status === 'played',
          rejected: status === 'rejected'
        })
        .eq('id', songId);

      if (error) {
        throw error;
      }

      setSongRequests(prev => 
        prev.map(song => 
          song.id === songId 
            ? { ...song, status } 
            : song
        )
      );

      toast.success(`Song marked as ${status}`);
    } catch (error) {
      console.error('Error updating song status:', error);
      toast.error('Failed to update song status');
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSongRequests((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update queue positions
        let queuePosition = 1;
        return reordered.map(item => ({
          ...item,
          queue_position: item.status === 'pending' ? queuePosition++ : item.queue_position
        }));
      });
    }
  }

  const eventUrl = event ? `${window.location.origin}/event/${event.id}` : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Song Requests - ${event?.name}`,
          text: 'Request songs for the event!',
          url: eventUrl,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = async () => {
    if (!event || !canvasRef.current || !qrRef.current) {
      toast.error('Failed to generate QR code');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size based on selected dimensions
      const [width, height] = selectedSize.dimensions.split('x').map(Number);
      canvas.width = width;
      canvas.height = height;

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Add gradient header
      const gradient = ctx.createLinearGradient(0, 0, width, 150);
      gradient.addColorStop(0, '#7c3aed');
      gradient.addColorStop(1, '#6d28d9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 150);

      // Add logo/title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Hey DJ', width / 2, 100);

      // Get QR code SVG
      const qrSvg = qrRef.current.querySelector('svg');
      if (!qrSvg) {
        throw new Error('QR code not found');
      }

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(qrSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create image from SVG
      const img = new Image();
      img.src = svgUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw QR code
      const qrSize = selectedSize.size;
      const qrX = (width - qrSize) / 2;
      const qrY = 200;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Clean up
      URL.revokeObjectURL(svgUrl);

      // Add event details
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'center';
      
      // Event name
      ctx.font = 'bold 48px system-ui';
      ctx.fillText(event.name, width / 2, qrY + qrSize + 80);

      // Event details
      ctx.font = '32px system-ui';
      let yPos = qrY + qrSize + 140;
      
      // Date
      ctx.fillText(
        `Date: ${format(new Date(event.created_at), 'MMMM d, yyyy')}`,
        width / 2,
        yPos
      );
      yPos += 50;

      // Time
      if (event.start_time) {
        ctx.fillText(
          `Time: ${format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a')}${
            event.end_time ? ` - ${format(new Date(`2000-01-01T${event.end_time}`), 'h:mm a')}` : ''
          }`,
          width / 2,
          yPos
        );
        yPos += 50;
      }

      // Location
      if (event.location) {
        ctx.fillText(`Location: ${event.location}`, width / 2, yPos);
        yPos += 50;
      }

      // Instructions
      ctx.font = '36px system-ui';
      ctx.fillText('Scan to request songs!', width / 2, yPos + 20);

      // URL
      ctx.font = '24px system-ui';
      ctx.fillText(eventUrl, width / 2, yPos + 70);

      // Download the image
      const link = document.createElement('a');
      const filename = `${event.name.toLowerCase().replace(/\s+/g, '-')}-qr-code.jpg`;
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.8);
      link.click();

      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const pendingRequests = songRequests.filter(song => song.status === 'pending');
  const playedRequests = songRequests.filter(song => song.status === 'played');
  const rejectedRequests = songRequests.filter(song => song.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <p className="text-gray-400">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1
              className={`text-2xl font-bold ${theme === 'dark' ? ' text-white  ' : ' text-black  '} `}>{event.name}</h1>
              
            <p className="text-gray-400">
              {format(new Date(event.created_at), 'MMMM d, yyyy')}
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

        {/* Share Section */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button
              onClick={() => setShowQRCode(!showQRCode)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              {showQRCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Collapsible QR Code Section */}
          {showQRCode && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex gap-4">
                <div 
                  ref={qrRef}
                  className="bg-white rounded-lg p-4 w-32 h-32 flex-shrink-0"
                >
                  <QRCodeSVG 
                    value={eventUrl} 
                    size={96} 
                    className="w-full h-full"
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      QR Code Size
                    </label>
                    <select
                      value={selectedSize.size}
                      onChange={(e) => setSelectedSize(QR_SIZES.find(s => s.size === Number(e.target.value)) || QR_SIZES[0])}
                      className="w-full bg-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {QR_SIZES.map((size) => (
                        <option key={size.size} value={size.size}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleDownloadQR} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Song Requests */}
      <div className="space-y-8">
        {/* Pending Requests */}
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Queue ({pendingRequests.length})</h2>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={pendingRequests} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No pending requests. Share the link with your audience to get started!
                  </p>
                ) : (
                  pendingRequests.map((song) => (
                    <SongRequestCard
                      key={song.id}
                      song={song}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Played Requests */}
        {playedRequests.length > 0 && (
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Played Songs ({playedRequests.length})</h2>
            <div className="space-y-4">
              {playedRequests.map((song) => (
                <SongRequestCard
                  key={song.id}
                  song={song}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Rejected Songs ({rejectedRequests.length})</h2>
            <div className="space-y-4">
              {rejectedRequests.map((song) => (
                <SongRequestCard
                  key={song.id}
                  song={song}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Share Event Link</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white"
              />
              <Button onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        className="absolute"
      />
    </div>
  );
}