import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { TemplateVisibility } from '@/types/enums';

interface Props {
  templateId: string;
  currentVisibility: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateVisibilityActions({ templateId, currentVisibility, isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState<string>(currentVisibility);

  const mutation = useMutation({
    mutationFn: async (newVisibility: string) => {
      return fetcher(`/admin/templates/${templateId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visibility: newVisibility }),
      });
    },
    onSuccess: () => {
      toast.success('Visibility updated');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-stats'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update visibility');
    },
  });

  const handleSave = () => {
    mutation.mutate(visibility);
  };

  const visibilityLabels: Record<string, string> = {
    draft: 'Draft (Private)',
    published: 'Published (Public)',
    featured: 'Featured (Highlighted)',
    hidden: 'Hidden (Archived)',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Visibility</DialogTitle>
          <DialogDescription>
            Update the publishing status of this template.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Visibility Status</Label>
            <Select value={visibility} onValueChange={(v) => v && setVisibility(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                {TemplateVisibility.map((v) => (
                  <SelectItem key={v} value={v}>
                    {visibilityLabels[v] ?? v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={mutation.isPending || visibility === currentVisibility}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
