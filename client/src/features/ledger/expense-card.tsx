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
  const getIconConfig = (category: ExpenseCategory) => {
    switch (category) {
      case 'accommodation':
        return {
          icon: <Hotel className="h-5 w-5 stroke-2" />,
          bg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
        };
      case 'food_and_drinks':
        return {
          icon: <Utensils className="h-5 w-5 stroke-2" />,
          bg: 'bg-orange-50 text-orange-600 border border-orange-100/50',
        };
      case 'transport':
        return {
          icon: <Car className="h-5 w-5 stroke-2" />,
          bg: 'bg-amber-50 text-amber-600 border border-amber-100/50',
        };
      case 'activities':
        return {
          icon: <Activity className="h-5 w-5 stroke-2" />,
          bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
        };
      default:
        return {
          icon: <HelpCircle className="h-5 w-5 stroke-2" />,
          bg: 'bg-neutral-100 text-neutral-600 border border-neutral-200/50',
        };
    }
  };

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/)[0];
  };

  const formattedDate = format(new Date(expense.incurredAt), 'MMM d, yyyy');
  const amount = parseFloat(expense.amount);

  const rawPayerName = (expense as Expense & { paidByUserName?: string }).paidByUserName || expense.paidBy?.name || 'Unknown';
  const payerName = rawPayerName !== 'Unknown' ? getFirstName(rawPayerName) : 'Unknown';
  const iconConfig = getIconConfig(expense.category);

  return (
    <Card className="relative transition-all duration-200 ring-0 border border-neutral-200/70 rounded-xl bg-white shadow-2xs overflow-hidden hover:border-[#09a474]/40 hover:shadow-xs">
      <CardContent className="p-4 sm:p-5 flex items-start gap-4">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconConfig.bg}`}>{iconConfig.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="font-semibold text-neutral-900 text-base sm:text-lg tracking-tight truncate">
                {expense.description}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 font-normal mt-0.5">
                Paid by <span className="font-semibold text-neutral-700">{payerName}</span> on{' '}
                {formattedDate}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-base sm:text-lg font-bold tracking-tight text-neutral-900">
                {formatCurrency(amount, expense.currency)}
              </p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-medium capitalize mt-0.5">
                {expense.splitMethod} Split
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
            <div>
              {expense.receiptUrl ? (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-[#2c6e49] hover:text-[#23583a] hover:underline transition-colors"
                >
                  <Receipt className="mr-1.5 h-3.5 w-3.5 stroke-[2.2]" />
                  View Receipt
                </a>
              ) : (
                <span className="text-xs text-neutral-400 font-normal select-none">No receipt</span>
              )}
            </div>

            {isOrganizerOrMember && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4 stroke-[1.8]" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 stroke-[1.8]" />
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
