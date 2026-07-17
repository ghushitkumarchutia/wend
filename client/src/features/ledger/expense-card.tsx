import { format } from 'date-fns';
import { Pencil, Trash, Receipt } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/types/models';
import { documentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import receiptFrame from '@/assets/images/receiptframe.png';

interface ExpenseCardProps {
  expense: Expense;
  isOrganizerOrMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseCard({ expense, isOrganizerOrMember, onEdit, onDelete }: ExpenseCardProps) {
  const handleViewReceipt = async () => {
    if (!expense.receiptUrl) return;
    if (expense.receiptUrl.startsWith('http://') || expense.receiptUrl.startsWith('https://')) {
      window.open(expense.receiptUrl, '_blank');
      return;
    }
    try {
      const res = await documentsApi.getDownloadUrl(expense.tripId, expense.receiptUrl);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Failed to get download URL');
      }
    } catch {
      toast.error('Failed to open receipt');
    }
  };

  const getCategoryConfig = (category: ExpenseCategory) => {
    switch (category) {
      case 'accommodation':
        return {
          label: 'ACCOMMODATION',
          bgClass: 'bg-[#FB6376]',
        };
      case 'food_and_drinks':
        return {
          label: 'FOOD & DRINKS',
          bgClass: 'bg-[#FF6F59]',
        };
      case 'transport':
        return {
          label: 'TRANSPORT',
          bgClass: 'bg-[#788CE3]',
        };
      case 'activities':
        return {
          label: 'ACTIVITIES',
          bgClass: 'bg-[#10B981]',
        };
      case 'miscellaneous':
      default:
        return {
          label: 'MISCELLANEOUS',
          bgClass: 'bg-[#19297C]',
        };
    }
  };

  const getSplitMethodLabel = (method: string) => {
    switch (method) {
      case 'equal':
        return 'EQUAL SPLIT';
      case 'exact':
        return 'EXACT SPLIT';
      case 'percentage':
        return 'PERCENTAGE SPLIT';
      default:
        return `${method.toUpperCase()} SPLIT`;
    }
  };

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/)[0];
  };

  const formattedDate = format(new Date(expense.incurredAt), 'MMM d, yyyy');
  const amount = parseFloat(expense.amount);

  const rawPayerName =
    (expense as Expense & { paidByUserName?: string }).paidByUserName ||
    expense.paidBy?.name ||
    'Unknown';
  const payerName = rawPayerName !== 'Unknown' ? getFirstName(rawPayerName) : 'Unknown';
  const categoryConfig = getCategoryConfig(expense.category);
  const splitLabel = getSplitMethodLabel(expense.splitMethod);

  return (
    <div
      className="relative w-full flex flex-col bg-transparent drop-shadow-[0_8px_16px_rgba(0,0,0,0.04)]"
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        className={cn(
          'relative z-10 h-[60px] px-5 pt-3.5 flex items-start justify-between rounded-t-[14px]',
          categoryConfig.bgClass,
        )}
      >
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[12px] md:text-[13px] tracking-wide text-white uppercase truncate">
            {categoryConfig.label}
          </span>
          <span className="text-[11px] text-white/80 font-normal tracking-wide truncate w-[160px]">
            {expense.description}
          </span>
        </div>

        {isOrganizerOrMember && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="h-7 w-7 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
              title="Edit Expense"
            >
              <Pencil className="h-3 w-3 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-7 w-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
              title="Delete Expense"
            >
              <Trash className="h-3 w-3 stroke-[2.2]" />
            </button>
          </div>
        )}
      </div>

      <div className="relative w-full -mt-4">
        <img
          src={receiptFrame}
          alt="Receipt Frame"
          className="w-full h-auto block pointer-events-none"
        />

        <div className="absolute inset-0 flex flex-col justify-between z-10">
          <div className="px-6 pt-7 flex flex-col justify-start space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-500">Total Amount:</span>
              <span className="text-neutral-900 font-bold text-sm tracking-normal">
                {formatCurrency(amount, expense.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-500">Paid By:</span>
              <span className="text-neutral-900 font-bold">{payerName}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-500">Paid On:</span>
              <span className="text-neutral-900 font-bold">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-500">Split Method:</span>
              <span className="text-neutral-900 font-bold uppercase tracking-wider">
                {splitLabel}
              </span>
            </div>
          </div>

          <div className="px-6 pb-[12%] flex flex-col items-center justify-end space-y-1.5">
            <p className="text-[10px] text-neutral-400 font-semibold text-center uppercase tracking-wider">
              {expense.receiptUrl ? 'Receipt Attached' : 'No Receipt Attached'}
            </p>

            <div className="w-full flex justify-center">
              {expense.receiptUrl ? (
                <button
                  type="button"
                  onClick={handleViewReceipt}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#E6F4EA] hover:bg-[#D2EBD9] text-[#137333] border border-[#137333]/15 rounded-[10px] text-[11px] font-semibold tracking-wide transition-colors cursor-pointer shadow-3xs"
                >
                  <Receipt className="h-3 w-3 stroke-[2.2]" />
                  View Receipt
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-neutral-50 text-neutral-400 border border-neutral-200/50 rounded-[10px] text-[11px] font-semibold tracking-wide select-none cursor-not-allowed"
                >
                  No Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
