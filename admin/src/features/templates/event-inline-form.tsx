import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TemplateEvent } from '@/types/models';
import { toast } from 'sonner';

interface Props {
  templateId: string;
  dayId: string;
  existingEventCount?: number;
  event?: TemplateEvent;
  onClose: () => void;
}

export function EventInlineForm({
  templateId,
  dayId,
  existingEventCount = 0,
  event,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: event?.title ?? '',
    time: event?.time ?? '',
    location: event?.location ?? '',
    description: event?.description ?? '',
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (event?.id) {
        return fetcher(`/admin/templates/${templateId}/events/${event.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        return fetcher(`/admin/templates/${templateId}/days/${dayId}/events`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast.success(event?.id ? 'Event updated' : 'Event added');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save event');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');

    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
    };

    if (event?.id) {
      payload.time = formData.time || null;
      payload.location = formData.location || null;
      payload.description = formData.description || null;
    } else {
      payload.order = existingEventCount;
      if (formData.time) payload.time = formData.time;
      if (formData.location) payload.location = formData.location;
      if (formData.description) payload.description = formData.description;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="rounded-md border p-4 bg-muted/50 mt-4 space-y-4">
      <h4 className="font-medium text-sm">{event?.id ? 'Edit Event' : 'Add New Event'}</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Visit Kiyomizu-dera"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Time (optional)</Label>
            <Input
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="e.g. 10:00 AM"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Location (optional)</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Kyoto, Japan"
          />
        </div>
        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Details about this activity..."
          />
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
