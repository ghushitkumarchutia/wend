import { format } from 'date-fns';
import { Pencil, Trash, Receipt, Utensils, Hotel, Car, Activity, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/types/models';

interface ExpenseCardProps {
  expense: Expense;
  isOrganizerOrMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseCard({ expense, isOrganizerOrMember, onEdit, onDelete }: ExpenseCardProps) {
  const getIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'accommodation': return <Hotel className="h-5 w-5 text-indigo-500" />;
      case 'food_and_drinks': return <Utensils className="h-5 w-5 text-orange-500" />;
      case 'transport': return <Car className="h-5 w-5 text-yellow-500" />;
      case 'activities': return <Activity className="h-5 w-5 text-green-500" />;
      default: return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formattedDate = format(new Date(expense.incurredAt), 'MMM d, yyyy');
  const amount = parseFloat(expense.amount);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4 flex gap-4">
        <div className="flex flex-col items-center justify-start pt-1 min-w-[50px]">
          {getIcon(expense.category)}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{expense.description}</h4>
              <p className="text-sm text-muted-foreground">
                Paid by <span className="font-medium text-foreground">{expense.paidBy?.name || 'Unknown'}</span> on {formattedDate}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold tracking-tight">{formatCurrency(amount, expense.currency)}</p>
              <p className="text-xs text-muted-foreground capitalize">{expense.splitMethod} Split</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {expense.receiptUrl ? (
                <a 
                  href={expense.receiptUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  <Receipt className="mr-1 h-3 w-3" />
                  View Receipt
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">No receipt</span>
              )}
            </div>

            {isOrganizerOrMember && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
