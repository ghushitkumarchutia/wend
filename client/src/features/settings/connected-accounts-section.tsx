import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function ConnectedAccountsSection() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your connected social accounts for quick login.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              G
            </div>
            <div>
              <p className="font-medium">Google</p>
              <p className="text-sm text-muted-foreground">
                {user?.email ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            {user?.email ? 'Manage' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
