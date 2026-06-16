import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MailPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteMemberSchema } from '@wend/shared';
import type { z } from 'zod';
import { api } from '@/lib/api-client';

type InviteFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMembersPanelProps {
  tripId: string;
}

export function InviteMembersPanel({ tripId }: InviteMembersPanelProps) {
  const queryClient = useQueryClient();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'member',
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteFormData) =>
      api.post(`/api/v1/trips/${tripId}/invites`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'invites'] });
      toast.success('Invitation sent');
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  const onSubmit = (data: InviteFormData) => {
    inviteMutation.mutate(data);
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <MailPlus className="size-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Invite to Trip</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={form.watch('role')}
            onValueChange={(v) => form.setValue('role', v as 'member' | 'viewer' | 'organizer')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">
                <div className="flex flex-col items-start">
                  <span>Member</span>
                  <span className="text-xs text-muted-foreground">
                    Can edit itinerary, log expenses, and participate in polls.
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="viewer">
                <div className="flex flex-col items-start">
                  <span>Viewer</span>
                  <span className="text-xs text-muted-foreground">
                    Can view details and chat, but cannot modify trip plans.
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={inviteMutation.isPending}
        >
          {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </form>
    </div>
  );
}
