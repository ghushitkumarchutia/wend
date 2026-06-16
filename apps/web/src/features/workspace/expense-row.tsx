import {
  BedDouble,
  Utensils,
  Car,
  Compass,
  CircleDot,
  Pencil,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExpenseWithParticipants } from '@wend/shared';
import type { ExpenseCategory } from '@wend/shared';
import type { LucideIcon } from 'lucide-react';

interface ExpenseRowProps {
  expense: ExpenseWithParticipants;
  currency: string;
  currentUserId: string;
  userRole: 'organizer' | 'member' | 'viewer';
  onEdit: (expense: ExpenseWithParticipants) => void;
  onDelete: (expense: ExpenseWithParticipants) => void;
}

const CATEGORY_ICON: Record<ExpenseCategory, LucideIcon> = {
  accommodation: BedDouble,
  food_and_drinks: Utensils,
  transport: Car,
  activities: Compass,
  miscellaneous: CircleDot,
};

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  accommodation: 'Accommodation',
  food_and_drinks: 'Food & Drinks',
  transport: 'Transport',
  activities: 'Activities',
  miscellaneous: 'Miscellaneous',
};

export function ExpenseRow({ expense, currency, currentUserId, userRole, onEdit, onDelete }: ExpenseRowProps) {
  const Icon = CATEGORY_ICON[expense.category];
  const isCreator = expense.createdByUserId === currentUserId;
  const isOrganizer = userRole === 'organizer';
  const canEdit = isCreator || isOrganizer;
  const canDelete = isCreator || isOrganizer;
  const isViewer = userRole === 'viewer';
  const participantCount = expense.participants.length;
  const isEqualSplit = expense.splitMethod === 'equal';

  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{expense.description}</span>
          <Badge variant="outline" className="shrink-0 text-xs">
            {CATEGORY_LABEL[expense.category]}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {currency} {parseFloat(expense.amount).toFixed(2)}
          </span>
          <span>Paid by {expense.paidByUserName}</span>
          <span>
            {new Date(expense.incurredAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          {isEqualSplit ? (
            <span>Split equally between {participantCount} member{participantCount !== 1 ? 's' : ''}</span>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help border-b border-dashed border-muted-foreground/50">
                    Custom split
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    {expense.participants.map((p) => (
                      <div key={p.userId} className="flex justify-between gap-4">
                        <span>{p.userName}</span>
                        <span>{currency} {parseFloat(p.shareAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {!isViewer && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {canEdit && (
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(expense)}>
              <Pencil className="size-3" />
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <MoreVertical className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(expense)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete expense
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
