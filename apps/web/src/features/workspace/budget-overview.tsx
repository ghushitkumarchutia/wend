import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { EXPENSE_CATEGORIES_LIST } from '@wend/shared';
import type { BudgetOverview, TripWithRole, ExpenseWithParticipants } from '@wend/shared';

interface BudgetOverviewPanelProps {
  trip: TripWithRole;
  overview: BudgetOverview;
  expenses: ExpenseWithParticipants[];
}

export function BudgetOverviewPanel({ trip, overview, expenses }: BudgetOverviewPanelProps) {
  const budget = trip.estimatedBudget ? parseFloat(trip.estimatedBudget) : null;
  const spent = overview.totalSpent;

  const categoryBreakdown = useMemo(() => {
    if (spent === 0) return [];
    const totals = new Map<string, number>();
    for (const exp of expenses) {
      const cat = exp.category;
      totals.set(cat, (totals.get(cat) ?? 0) + parseFloat(exp.amount));
    }
    return EXPENSE_CATEGORIES_LIST.filter((c) => totals.has(c.value)).map((c) => ({
      label: c.label,
      percent: Math.round(((totals.get(c.value) ?? 0) / spent) * 100),
    }));
  }, [expenses, spent]);

  if (budget === null) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Budget</h4>
        <p className="text-xs text-muted-foreground">
          No budget set. Add one in trip settings.
        </p>
      </div>
    );
  }

  const remaining = budget - spent;
  const percent = Math.min(Math.round((spent / budget) * 100), 100);
  const isOver = remaining < 0;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Budget</h4>
      <Progress value={percent} className="h-2" />
      <div className="flex items-center justify-between text-xs">
        <span>Spent: {trip.baseCurrency} {spent.toFixed(2)}</span>
        <span>Budget: {trip.baseCurrency} {budget.toFixed(2)}</span>
      </div>
      <p className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>
        {trip.baseCurrency} {Math.abs(remaining).toFixed(2)} {isOver ? 'over budget' : 'remaining'}
      </p>
      {categoryBreakdown.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {categoryBreakdown.map((c) => `${c.label} ${c.percent}%`).join(' · ')}
        </p>
      )}
    </div>
  );
}
