import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SettlementSuggestions } from './settlement-suggestions';
import type { MemberBalance } from '@/types/api';

interface BalancesSidebarProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  currency: string;
}

export function BalancesSidebar({ tripId, isOrganizerOrMember, currency }: BalancesSidebarProps) {
  const {
    data: balancesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => ledgerApi.getBalances(tripId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full bg-neutral-100" />
          <Skeleton className="h-10 w-full bg-neutral-100" />
        </CardContent>
      </Card>
    );
  }

  if (error || !balancesData) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Failed to load balances.</CardContent>
      </Card>
    );
  }

  const rawData = balancesData.data;
  const balances: MemberBalance[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.balances)
      ? rawData.balances
      : [];
  const activeCurrency = currency || (!Array.isArray(rawData) && rawData?.currency) || 'USD';

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No balances yet. Log an expense to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {balances.map((mb: MemberBalance) => {
                const balanceVal = parseFloat(mb.balance);
                const isPositive = balanceVal > 0;
                const isNegative = balanceVal < 0;

                const name = mb.user?.name || mb.user?.email || 'User';
                const image = mb.user?.image || '';
                const fallbackChar = name.charAt(0);

                return (
                  <div key={mb.userId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={image} />
                        <AvatarFallback>{fallbackChar}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium leading-none">{name}</div>
                    </div>
                    <div
                      className={`text-sm font-semibold text-right ${isPositive ? 'text-green-500' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrency(balanceVal, activeCurrency)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SettlementSuggestions tripId={tripId} isOrganizerOrMember={isOrganizerOrMember} currency={activeCurrency} />
    </div>
  );
}
