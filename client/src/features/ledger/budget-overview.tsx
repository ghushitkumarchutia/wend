import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BudgetOverviewProps {
  tripId: string;
}

export function BudgetOverview({ tripId }: BudgetOverviewProps) {
  const { data: budgetData, isLoading, error } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => ledgerApi.getBudgetOverview(tripId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !budgetData) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load budget overview.
        </CardContent>
      </Card>
    );
  }

  const { estimatedBudget, totalSpent, currency, byCategory } = budgetData.data;
  
  const spent = parseFloat(totalSpent);
  const budget = estimatedBudget ? parseFloat(estimatedBudget) : 0;
  
  const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const isOverBudget = budget > 0 && spent > budget;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
            <p className={`text-2xl font-bold tracking-tight ${isOverBudget ? 'text-destructive' : ''}`}>
              {formatCurrency(spent, currency)}
            </p>
          </div>
          {budget > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium">Budget</p>
              <p className="text-lg font-semibold text-muted-foreground">
                {formatCurrency(budget, currency)}
              </p>
            </div>
          )}
        </div>

        {budget > 0 && (
          <div className="space-y-1">
            <Progress value={percentage} className={isOverBudget ? 'bg-destructive/20 [&>div]:bg-destructive' : ''} />
            <p className="text-xs text-muted-foreground text-right">
              {percentage}% used
            </p>
          </div>
        )}

        {Object.keys(byCategory).length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(byCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between">
                  <span className="capitalize text-muted-foreground">{category.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amount), currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
