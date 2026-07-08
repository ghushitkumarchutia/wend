import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlightDetailsFields, type FlightDetailsFormValues } from './flight-details-fields';
import { itineraryApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ItineraryEvent, EventCategory } from '@/types/models';

interface AddEditEventModalProps {
  tripId: string;
  event?: ItineraryEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripStartDate: string;
}

export function AddEditEventModal({ tripId, event, open, onOpenChange, tripStartDate }: AddEditEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update the details for this scheduled event.' : 'Schedule a new activity, flight, or booking for this trip.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <EventForm 
            tripId={tripId} 
            event={event} 
            tripStartDate={tripStartDate} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EventFormProps {
  tripId: string;
  event?: ItineraryEvent;
  tripStartDate: string;
  onClose: () => void;
}

function EventForm({ tripId, event, tripStartDate, onClose }: EventFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'activity');
  
  const getInitialStartAt = () => {
    if (event?.startAt) {
      const s = new Date(event.startAt);
      return new Date(s.getTime() - s.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const s = new Date(tripStartDate);
    s.setHours(10, 0, 0, 0);
    return new Date(s.getTime() - s.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  
  const getInitialEndAt = () => {
    if (event?.endAt) {
      const e = new Date(event.endAt);
      return new Date(e.getTime() - e.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    return '';
  };
  
  const [startAt, setStartAt] = useState(getInitialStartAt);
  const [endAt, setEndAt] = useState(getInitialEndAt);
  const [location, setLocation] = useState(event?.location || '');
  const [notes, setNotes] = useState(event?.notes || '');
  
  const [flightDetails, setFlightDetails] = useState<FlightDetailsFormValues>(() => {
    if (event?.flightDetails) {
      return {
        airline: event.flightDetails.airline || undefined,
        flightNumber: event.flightDetails.flightNumber || undefined,
        departureAirport: event.flightDetails.departureAirport || undefined,
        arrivalAirport: event.flightDetails.arrivalAirport || undefined,
        confirmationRef: event.flightDetails.confirmationRef || undefined,
        terminal: event.flightDetails.terminal || undefined,
        gate: event.flightDetails.gate || undefined,
        seat: event.flightDetails.seat || undefined,
        baggageAllowance: event.flightDetails.baggageAllowance || undefined,
      };
    }
    return {};
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startAt) return;

    try {
      setIsSubmitting(true);
      
      const payload = {
        title,
        category,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        location: location || undefined,
        notes: notes || undefined,
        flightDetails: category === 'flight' ? flightDetails : undefined,
      };

      if (event) {
        await itineraryApi.updateEvent(tripId, event.id, {
          ...payload,
          version: event.version,
        });
        toast.success('Event updated');
      } else {
        await itineraryApi.createEvent(tripId, payload);
        toast.success('Event added to itinerary');
      }
      
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save event';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="event-title">Title *</Label>
        <Input
          id="event-title"
          placeholder="e.g. Dinner at Luigi's"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-category">Category</Label>
        <Select 
          value={category} 
          onValueChange={(val) => val && setCategory(val as EventCategory)} 
          disabled={isSubmitting}
        >
          <SelectTrigger id="event-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="flight">Flight</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-start">Start Time *</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">End Time</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-location">Location / Address</Label>
        <Input
          id="event-location"
          placeholder="e.g. 123 Main St"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-notes">Notes</Label>
        <Textarea
          id="event-notes"
          placeholder="Any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {category === 'flight' && (
        <FlightDetailsFields 
          value={flightDetails}
          onChange={setFlightDetails}
          disabled={isSubmitting}
        />
      )}

      <DialogFooter className="pt-4 border-t mt-4">
        <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !title || !startAt}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </Button>
      </DialogFooter>
    </form>
  );
}
