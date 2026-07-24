import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Invoice01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { ExpenseCard } from './expense-card';
import { ledgerApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { LogExpenseModal } from './log-expense-modal';
import { DeleteExpenseDialog } from './delete-expense-dialog';
import type { Expense } from '@/types/models';

interface ExpenseListProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  currency: string;
}

export function ExpenseList({ tripId, isOrganizerOrMember, currency }: ExpenseListProps) {
  const queryClient = useQueryClient();
  const [isLogExpenseModalOpen, setIsLogExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const {
    data: expensesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => ledgerApi.getExpenses(tripId),
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm font-light font-manrope">
        Loading expenses...
      </div>
    );
  }

  if (error || !expensesData) {
    return (
      <div className="py-8 text-center text-destructive text-sm font-medium font-manrope">
        Failed to load expenses.
      </div>
    );
  }

  const expenses = expensesData.data.expenses;

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    try {
      await ledgerApi.deleteExpense(tripId, deletingExpense.id);
      toast.success('Expense deleted');
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', 'suggestions', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete expense';
      toast.error(msg);
      throw err;
    }
  };

  return (
    <div className="space-y-2.5 md:space-y-3 font-manrope">
      <div className="flex items-center justify-between mt-1 md:-mt-3">
        <h2 className="text-[18px] md:text-2xl font-semibold tracking-wide text-neutral-900 font-syne">
          Ledger
        </h2>
        {isOrganizerOrMember && (
          <Button
            variant="waterdrop"
            onClick={() => setIsLogExpenseModalOpen(true)}
            className="pl-2 md:pl-2.5 pr-2.5 md:pr-3.5 py-1.5 md:py-1.75 h-auto inline-flex items-center cursor-pointer"
          >
            <div
              className="size-3.5 md:size-5.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform translate-y-[-0.4px]"
              style={{
                boxShadow: `
                  inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                  inset 0 1px 2px rgba(255, 255, 255, 1),
                  0 2px 4px rgba(0, 0, 0, 0.15)
                `,
              }}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                className="size-2.5 md:size-3.5 block"
                color="#10b981"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-[10px] md:text-sm font-semibold tracking-wide text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] leading-none relative top-[-0.7px] md:top-[-1.5px]">
              Add Expense
            </span>
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300/80 bg-white py-8.5 px-5 md:px-6 text-center select-none"
          style={{
            boxShadow:
              'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="mx-auto flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-neutral-100 mb-2">
            <HugeiconsIcon
              icon={Invoice01Icon}
              className="h-5 w-5 md:h-5.5 md:w-5.5 text-neutral-400"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-sm md:text-base font-semibold font-syne text-neutral-800">
            No expenses yet
          </h3>
          <p className="text-xs text-neutral-500 font-manrope mt-0.5">
            Keep track of shared costs on this trip.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              isOrganizerOrMember={isOrganizerOrMember}
              onEdit={() => setEditingExpenseId(expense.id)}
              onDelete={() => setDeletingExpense(expense)}
            />
          ))}
        </div>
      )}

      <LogExpenseModal
        tripId={tripId}
        open={isLogExpenseModalOpen}
        onOpenChange={setIsLogExpenseModalOpen}
        currency={currency}
      />
      {editingExpenseId && (
        <LogExpenseModal
          tripId={tripId}
          expense={expenses.find((e) => e.id === editingExpenseId)}
          open={!!editingExpenseId}
          onOpenChange={(open) => !open && setEditingExpenseId(null)}
          currency={currency}
        />
      )}
      {deletingExpense && (
        <DeleteExpenseDialog
          open={!!deletingExpense}
          onOpenChange={(open) => !open && setDeletingExpense(null)}
          onConfirm={handleDeleteConfirm}
          expenseDescription={deletingExpense.description}
        />
      )}
    </div>
  );
}
