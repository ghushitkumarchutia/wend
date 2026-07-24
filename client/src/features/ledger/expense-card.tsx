import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ReceiptTextIcon,
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/types/models';
import { documentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import tabSvg from '@/assets/svg/tab.svg';

interface ExpenseCardProps {
  expense: Expense;
  isOrganizerOrMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function getExpenseCategoryTheme(category: ExpenseCategory) {
  switch (category) {
    case 'accommodation':
      return {
        label: 'Accommodation',
        categoryBg: '#F0E9FF',
        pillBorder: 'rgba(109, 40, 217, 0.25)',
        accent: '#6D28D9',
      };
    case 'food_and_drinks':
      return {
        label: 'Food & Drinks',
        categoryBg: '#FFEAD9',
        pillBorder: 'rgba(234, 88, 12, 0.25)',
        accent: '#EA580C',
      };
    case 'transport':
      return {
        label: 'Transport',
        categoryBg: '#E2F0FF',
        pillBorder: 'rgba(37, 99, 235, 0.25)',
        accent: '#2563EB',
      };
    case 'activities':
      return {
        label: 'Activities',
        categoryBg: '#E0F5EA',
        pillBorder: 'rgba(21, 128, 61, 0.25)',
        accent: '#059669',
      };
    case 'miscellaneous':
    default:
      return {
        label: 'Miscellaneous',
        categoryBg: '#ECECF0',
        pillBorder: 'rgba(100, 116, 139, 0.25)',
        accent: '#4B5563',
      };
  }
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

  const getSplitMethodLabel = (method: string) => {
    switch (method) {
      case 'equal':
        return 'EQUAL SPLIT';
      case 'exact':
      case 'unequal':
        return 'EXACT SPLIT';
      case 'percentage':
        return 'PERCENTAGE SPLIT';
      case 'custom':
        return 'CUSTOM SHARES';
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
  const theme = getExpenseCategoryTheme(expense.category);
  const splitLabel = getSplitMethodLabel(expense.splitMethod);

  return (
    <div className="relative w-full h-full mt-5 md:mt-6.75 font-manrope">
      <div
        aria-hidden="true"
        className="absolute -top-5.5 md:-top-6.75 left-0 h-6.25 md:h-7.5 w-48 md:w-58.75 max-w-[70%] pointer-events-none z-10"
        style={{
          backgroundColor: '#FFFFFF',
          WebkitMaskImage: `url(${tabSvg})`,
          maskImage: `url(${tabSvg})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'left top',
          maskPosition: 'left top',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />

      <div className="absolute -top-3.75 md:-top-4.5 left-2.5 md:left-3.5 z-20 pointer-events-none select-none">
        <div
          className="relative inline-flex items-center justify-center px-2.5 md:px-3 py-1 rounded-full border border-white/90 backdrop-blur-md transition-all"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.categoryBg} 100%)`,
            boxShadow: `
              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
              0 4px 12px -2px rgba(0, 0, 0, 0.08),
              0 1px 3px 0 ${theme.pillBorder}
            `,
          }}
        >
          <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

          <span
            className="font-syne text-[8.5px] md:text-[9.5px] font-semibold uppercase tracking-wider leading-none relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
            style={{ color: theme.accent }}
          >
            {theme.label}
          </span>
        </div>
      </div>

      <div className="relative w-full rounded-3xl rounded-tl-none p-1 bg-white shadow-2xs flex flex-col justify-between select-none">
        <div
          className="w-full rounded-2xl px-3.5 md:px-4 pt-3.5 md:pt-4 pb-3.5 md:pb-4 space-y-2.5 flex flex-col justify-between transition-colors"
          style={{
            background: `linear-gradient(to top, ${theme.categoryBg} 0%, #FFFFFF 100%)`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-syne font-semibold text-neutral-900 text-sm md:text-[15px] tracking-tight truncate leading-snug">
                {expense.description || 'Untitled Expense'}
              </h4>
            </div>

            {isOrganizerOrMember && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/5 transition-colors focus-visible:outline-none h-6 w-6 md:h-7 md:w-7 p-0 shrink-0 cursor-pointer mt-[-2.5px]">
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon
                    icon={MoreHorizontalCircle01Icon}
                    className="size-4 md:size-4.5 block"
                    strokeWidth={1.5}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-auto min-w-0 bg-white/95 backdrop-blur-md border border-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-full p-1 z-50 flex items-center gap-0.5"
                >
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="rounded-full px-1.5 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-black/5 focus:bg-black/5 focus:text-neutral-900 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                    title="Edit Expense"
                  >
                    <HugeiconsIcon
                      icon={PencilEdit02Icon}
                      className="size-4 block"
                      strokeWidth={1.5}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="rounded-full px-1.5 py-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                    title="Delete Expense"
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="size-4 block" strokeWidth={1.5} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-baseline justify-between pt-0.5 pb-2 border-b border-black/5">
            <span className="text-[11px] font-medium text-neutral-400 tracking-wide font-manrope">
              Total Amount
            </span>
            <span className="font-syne font-bold text-base md:text-lg tracking-normal text-neutral-900">
              {formatCurrency(amount, expense.currency)}
            </span>
          </div>

          <div className="space-y-2 text-xs font-manrope py-0.5">
            <div className="flex justify-between items-center text-[11px] md:text-xs">
              <span className="text-neutral-400 font-medium tracking-wide">Paid By</span>
              <span className="font-semibold text-neutral-800 font-manrope">{payerName}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-xs">
              <span className="text-neutral-400 font-medium tracking-wide">Paid On</span>
              <span className="font-semibold text-neutral-800 font-manrope">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-xs">
              <span className="text-neutral-400 font-medium tracking-wide">Split Method</span>
              <span className="font-semibold text-neutral-800 uppercase tracking-wider font-manrope">
                {splitLabel}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5">
            {expense.receiptUrl ? (
              <button
                type="button"
                onClick={handleViewReceipt}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.75 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#059669] border border-[#10b981]/20 rounded-xl text-xs font-semibold font-manrope transition-colors cursor-pointer shadow-3xs"
              >
                <HugeiconsIcon icon={ReceiptTextIcon} className="size-3.5 block" strokeWidth={2} />
                <span>View Receipt</span>
              </button>
            ) : (
              <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/5 text-neutral-400 border border-neutral-200/40 rounded-xl text-xs font-medium font-manrope select-none">
                <span className="text-[11px]">No Receipt Attached</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
