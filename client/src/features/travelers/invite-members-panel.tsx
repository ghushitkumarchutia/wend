import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripMemberRole } from '@/types/models';
import { Mail } from 'lucide-react';

interface InviteMembersPanelProps {
  tripId: string;
}

export function InviteMembersPanel({ tripId }: InviteMembersPanelProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TripMemberRole>('member');
  const [name, setName] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await travelersApi.sendInvite(tripId, { email, role, name: name || undefined });
      toast.success('Invite sent successfully!');
      setEmail('');
      setName('');
      setRole('member');
      queryClient.invalidateQueries({ queryKey: ['trip-invites', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send invite.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invite Travelers</CardTitle>
        <CardDescription>
          Send an email invitation to add someone to this trip.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Name (Optional)</Label>
            <Input
              id="invite-name"
              placeholder="e.g., Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(val) => val && setRole(val as TripMemberRole)} disabled={isSubmitting}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !email}>
            <Mail className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
