import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BudgetOverviewPanel } from '@/features/workspace/budget-overview';
import { BalancesSidebar } from '@/features/workspace/balances-sidebar';
import { SettlementSuggestions } from '@/features/workspace/settlement-suggestions';
import { ExpenseRow } from '@/features/workspace/expense-row';
import { LogExpenseModal } from '@/features/workspace/log-expense-modal';
import { SettleUpModal } from '@/features/workspace/settle-up-modal';
import type {
  TripWithRole,
  MemberWithUser,
  ExpenseWithParticipants,
  BalanceEntry,
  SettlementSuggestion,
  BudgetOverview,
} from '@wend/shared';

interface LedgerTabProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
}

export function LedgerTab({ trip, members, currentUserId }: LedgerTabProps) {
  const queryClient = useQueryClient();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithParticipants | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithParticipants | null>(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleSuggestion, setSettleSuggestion] = useState<SettlementSuggestion | null>(null);

  const expensesQuery = useQuery({
    queryKey: ['trips', trip.id, 'expenses'],
    queryFn: () =>
      api.get<{ data: ExpenseWithParticipants[] }>(`/api/v1/trips/${trip.id}/expenses`),
  });

  const balancesQuery = useQuery({
    queryKey: ['trips', trip.id, 'balances'],
    queryFn: () => api.get<{ data: BalanceEntry[] }>(`/api/v1/trips/${trip.id}/balances`),
  });

  const suggestionsQuery = useQuery({
    queryKey: ['trips', trip.id, 'settlements', 'suggestions'],
    queryFn: () =>
      api.get<{ data: SettlementSuggestion[] }>(`/api/v1/trips/${trip.id}/settlements/suggestions`),
  });

  const budgetQuery = useQuery({
    queryKey: ['trips', trip.id, 'budget'],
    queryFn: () => api.get<{ data: BudgetOverview }>(`/api/v1/trips/${trip.id}/budget`),
  });

  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) => api.delete(`/api/v1/trips/${trip.id}/expenses/${expenseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'settlements'] });
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'budget'] });
      setDeleteTarget(null);
      toast.success('Expense deleted');
    },
  });

  const expenses = expensesQuery.data?.data ?? [];
  const balances = balancesQuery.data?.data ?? [];
  const suggestions = suggestionsQuery.data?.data ?? [];
  const budgetOverview = budgetQuery.data?.data ?? { totalSpent: 0, expenseCount: 0 };
  const isViewer = trip.role === 'viewer';

  function handleAddExpense() {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  }

  function handleEditExpense(expense: ExpenseWithParticipants) {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  }

  function handleSettle(suggestion: SettlementSuggestion) {
    setSettleSuggestion(suggestion);
    setSettleModalOpen(true);
  }

  function handleCreateSettlement() {
    setSettleSuggestion(null);
    setSettleModalOpen(true);
  }

  if (expensesQuery.isLoading || balancesQuery.isLoading) {
    return (
      <div className="flex gap-6">
        <div className="hidden w-72 shrink-0 space-y-6 lg:block">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (expensesQuery.isError) {
    return <ErrorState message="Couldn't load expenses." onRetry={() => expensesQuery.refetch()} />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <BudgetOverviewPanel trip={trip} overview={budgetOverview} expenses={expenses} />
          <Separator />
          <BalancesSidebar balances={balances} currency={trip.baseCurrency} />
          <Separator />
          <SettlementSuggestions
            suggestions={suggestions}
            currency={trip.baseCurrency}
            onSettle={handleSettle}
          />
          {!isViewer && (
            <Button variant="outline" size="sm" className="w-full" onClick={handleCreateSettlement}>
              Create Settlement
            </Button>
          )}
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Expense Log</h3>
            {!isViewer && (
              <Button size="sm" onClick={handleAddExpense}>
                <Plus className="mr-1.5 size-3.5" />
                Log Expense
              </Button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No expenses recorded yet. Log your first shared expense.
              </p>
              {!isViewer && (
                <Button size="sm" onClick={handleAddExpense}>
                  <Plus className="mr-1.5 size-3.5" />
                  Log Expense
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  currency={trip.baseCurrency}
                  currentUserId={currentUserId}
                  userRole={trip.role}
                  onEdit={handleEditExpense}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <LogExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        tripId={trip.id}
        members={members}
        currentUserId={currentUserId}
        currency={trip.baseCurrency}
        expense={editingExpense}
      />

      <SettleUpModal
        open={settleModalOpen}
        onOpenChange={setSettleModalOpen}
        tripId={trip.id}
        members={members}
        suggestion={settleSuggestion}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete expense"
        description="Delete this expense? The split amounts will be removed and balances will be recalculated."
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </>
  );
}
