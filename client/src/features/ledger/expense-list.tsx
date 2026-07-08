import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseCard } from './expense-card';
import { ledgerApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { LogExpenseModal } from './log-expense-modal';

interface ExpenseListProps {
  tripId: string;
  isOrganizerOrMember: boolean;
}

export function ExpenseList({ tripId, isOrganizerOrMember }: ExpenseListProps) {
  const queryClient = useQueryClient();
  const [isLogExpenseModalOpen, setIsLogExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const { data: expensesData, isLoading, error } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => ledgerApi.getExpenses(tripId),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading expenses...</div>;
  }

  if (error || !expensesData) {
    return <div className="py-8 text-center text-destructive">Failed to load expenses.</div>;
  }

  const expenses = expensesData.data.expenses;

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense? This will recalculate all balances.')) return;
    try {
      await ledgerApi.deleteExpense(tripId, expenseId);
      toast.success('Expense deleted');
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', 'suggestions', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete expense';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Expenses</h2>
        {isOrganizerOrMember && (
          <Button onClick={() => setIsLogExpenseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium">No expenses yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Keep track of shared costs on this trip.</p>
          {isOrganizerOrMember && (
            <Button variant="outline" onClick={() => setIsLogExpenseModalOpen(true)}>
              Log the first expense
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard 
              key={expense.id} 
              expense={expense} 
              isOrganizerOrMember={isOrganizerOrMember}
              onEdit={() => setEditingExpenseId(expense.id)}
              onDelete={() => handleDelete(expense.id)}
            />
          ))}
        </div>
      )}

      <LogExpenseModal 
        tripId={tripId} 
        open={isLogExpenseModalOpen} 
        onOpenChange={setIsLogExpenseModalOpen} 
      />
      {editingExpenseId && (
        <LogExpenseModal
          tripId={tripId}
          expense={expenses.find(e => e.id === editingExpenseId)}
          open={!!editingExpenseId}
          onOpenChange={(open) => !open && setEditingExpenseId(null)}
        />
      )}
    </div>
  );
}
