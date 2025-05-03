import React from 'react';
import { Music2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { format } from 'date-fns';

interface RequestsByEvent {
  event_name: string;
  event_date: string;
  total_requests: number;
  active: boolean;
}

interface TotalRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestsByEvent: RequestsByEvent[];
}

export function TotalRequestsDialog({
  open,
  onOpenChange,
  requestsByEvent,
}: TotalRequestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            Total Requests by Event
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {requestsByEvent.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No requests found for any events
            </p>
          ) : (
            requestsByEvent.map((item) => (
              <div
                key={item.event_name}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{item.event_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.event_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.active
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {item.active ? 'Active' : 'Ended'}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {item.total_requests}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}