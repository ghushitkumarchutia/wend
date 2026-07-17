import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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

  const { data: expensesData, isLoading, error } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => ledgerApi.getExpenses(tripId),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm font-light">Loading expenses...</div>;
  }

  if (error || !expensesData) {
    return <div className="py-8 text-center text-destructive text-sm font-medium">Failed to load expenses.</div>;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Ledger</h2>
        {isOrganizerOrMember && (
          <Button 
            className="bg-[#2c6e49] hover:bg-[#23583a] text-white font-medium rounded-[12px] h-8.5 px-3.5 text-xs cursor-pointer shadow-xs transition-all duration-200 border-none flex items-center justify-center focus-visible:ring-0!"
            onClick={() => setIsLogExpenseModalOpen(true)}
          >
            <Plus className="mr-1 h-3.5 w-3.5 stroke-[2.5]" />
            Add Expense
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-[#F8F9FA]/40 border border-dashed border-neutral-200/80 rounded-2xl">
          <h3 className="text-sm font-semibold text-neutral-800">No expenses yet</h3>
          <p className="text-xs text-neutral-400 font-light mt-1">Keep track of shared costs on this trip.</p>
          {isOrganizerOrMember && (
            <Button 
              className="bg-[#2c6e49] hover:bg-[#23583a] text-white font-medium rounded-[12px] h-8.5 px-3.5 text-xs cursor-pointer shadow-xs transition-all duration-200 border-none flex items-center justify-center mt-4 focus-visible:ring-0!"
              onClick={() => setIsLogExpenseModalOpen(true)}
            >
              Log the first expense
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          expense={expenses.find(e => e.id === editingExpenseId)}
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
