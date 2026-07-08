import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { invitesApi } from '@/lib/api-client';
import { toast } from 'sonner';

export const Route = createLazyFileRoute('/invites/accept')({
  component: InvitesAcceptRoute,
});

function InvitesAcceptRoute() {
  const { token } = Route.useSearch();
  const { user, isPending } = useAuth();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !user && token) {
      router.navigate({
        to: '/sign-in',
      });
    }
  }, [isPending, user, token, router]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setIsProcessing(true);
      setError(null);
      await invitesApi.accept(token);
      toast.success('Invite accepted successfully!');
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invite.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    try {
      setIsProcessing(true);
      setError(null);
      await invitesApi.decline(token);
      toast.success('Invite declined.');
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to decline invite.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPending || (!user && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>No invite token was provided in the URL.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.navigate({ to: '/dashboard' })}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Trip Invitation</CardTitle>
          <CardDescription>You have been invited to join a trip.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Would you like to accept this invitation? Once accepted, you will have access to the trip workspace.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDecline} 
            disabled={isProcessing}
          >
            Decline
          </Button>
          <Button 
            className="w-full" 
            onClick={handleAccept} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Accept Invite'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
