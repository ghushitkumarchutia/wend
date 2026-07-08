import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { travelersApi } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import type { SplitMethod } from '@/types/models';

export interface ParticipantShare {
  userId: string;
  shareAmount: number;
  isSelected: boolean;
  inputValue: string;
}

interface SplitMethodFieldsProps {
  tripId: string;
  totalAmount: number;
  splitMethod: SplitMethod;
  value: ParticipantShare[];
  onChange: (shares: ParticipantShare[]) => void;
  disabled?: boolean;
}

export function SplitMethodFields({
  tripId,
  totalAmount,
  splitMethod,
  value,
  onChange,
  disabled,
}: SplitMethodFieldsProps) {
  const { data: membersData } = useQuery({
    queryKey: ['travelers', tripId],
    queryFn: () => travelersApi.getMembers(tripId),
  });

  const members = useMemo(() => membersData?.data.members || [], [membersData]);

  useEffect(() => {
    if (members.length > 0 && value.length === 0) {
      const initial: ParticipantShare[] = members.map((m) => ({
        userId: m.userId,
        shareAmount: 0,
        isSelected: true,
        inputValue: '',
      }));
      onChange(initial);
    }
  }, [members, value.length, onChange]);

  useEffect(() => {
    if (value.length === 0) return;

    let newShares = [...value];
    const selectedCount = newShares.filter((s) => s.isSelected).length;

    if (splitMethod === 'equal') {
      if (selectedCount === 0) {
        newShares = newShares.map((s) => ({ ...s, shareAmount: 0 }));
      } else {
        const baseAmount = Math.floor((totalAmount / selectedCount) * 100) / 100;
        let remainingCents = Math.round((totalAmount - baseAmount * selectedCount) * 100);

        newShares = newShares.map((s) => {
          if (!s.isSelected) return { ...s, shareAmount: 0 };
          let amount = baseAmount;
          if (remainingCents > 0) {
            amount += 0.01;
            remainingCents -= 1;
          }
          return { ...s, shareAmount: Number(amount.toFixed(2)) };
        });
      }
    } else if (splitMethod === 'unequal') {
      newShares = newShares.map((s) => ({
        ...s,
        shareAmount: s.isSelected && s.inputValue ? parseFloat(s.inputValue) || 0 : 0,
      }));
    } else if (splitMethod === 'percentage') {
      newShares = newShares.map((s) => {
        if (!s.isSelected || !s.inputValue) return { ...s, shareAmount: 0 };
        const percent = parseFloat(s.inputValue) || 0;
        const amount = (totalAmount * percent) / 100;
        return { ...s, shareAmount: Number(amount.toFixed(2)) };
      });
    } else if (splitMethod === 'custom') {
      const totalShares = newShares.reduce(
        (sum, s) => sum + (s.isSelected ? parseFloat(s.inputValue) || 0 : 0),
        0,
      );
      if (totalShares === 0) {
        newShares = newShares.map((s) => ({ ...s, shareAmount: 0 }));
      } else {
        const baseShareAmount = totalAmount / totalShares;
        newShares = newShares.map((s) => {
          if (!s.isSelected || !s.inputValue) return { ...s, shareAmount: 0 };
          const shares = parseFloat(s.inputValue) || 0;
          return { ...s, shareAmount: Number((baseShareAmount * shares).toFixed(2)) };
        });
      }
    }

    const hasChanged = newShares.some((s, i) => s.shareAmount !== value[i].shareAmount);
    if (hasChanged) {
      onChange(newShares);
    }
  }, [splitMethod, totalAmount, value, onChange]);

  if (members.length === 0 || value.length === 0) {
    return <div className="text-sm text-muted-foreground">Loading participants...</div>;
  }

  const handleToggle = (userId: string, checked: boolean) => {
    onChange(value.map((s) => (s.userId === userId ? { ...s, isSelected: checked } : s)));
  };

  const handleInputChange = (userId: string, val: string) => {
    onChange(value.map((s) => (s.userId === userId ? { ...s, inputValue: val } : s)));
  };

  const currentTotal = value.reduce((sum, s) => sum + s.shareAmount, 0);
  const diff = Math.abs(totalAmount - currentTotal);
  const isBalanced = diff < 0.02;

  return (
    <div className="space-y-4 pt-4 border-t mt-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">Split Details</h4>
        <span
          className={`text-xs font-medium ${isBalanced ? 'text-green-500' : 'text-destructive'}`}
        >
          Total Assigned: {formatCurrency(currentTotal, 'USD')} /{' '}
          {formatCurrency(totalAmount, 'USD')}
        </span>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const share = value.find((s) => s.userId === member.userId);
          if (!share) return null;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between p-2 rounded-md border bg-card"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`split-${member.userId}`}
                  checked={share.isSelected}
                  onCheckedChange={(checked) => handleToggle(member.userId, checked as boolean)}
                  disabled={disabled}
                />
                <Label htmlFor={`split-${member.userId}`} className="cursor-pointer font-medium">
                  {member.user?.name || member.user?.email || 'Unknown'}
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                {share.isSelected && splitMethod !== 'equal' && (
                  <div className="flex items-center space-x-1">
                    <Input
                      type="number"
                      className="h-8 w-20 text-right"
                      placeholder={
                        splitMethod === 'percentage'
                          ? '%'
                          : splitMethod === 'custom'
                            ? 'shares'
                            : '$'
                      }
                      value={share.inputValue}
                      onChange={(e) => handleInputChange(member.userId, e.target.value)}
                      disabled={disabled}
                    />
                    <span className="text-xs text-muted-foreground">
                      {splitMethod === 'percentage' ? '%' : splitMethod === 'custom' ? 'sh' : ''}
                    </span>
                  </div>
                )}

                <div className="text-sm font-semibold min-w-[70px] text-right">
                  {share.isSelected ? formatCurrency(share.shareAmount, 'USD') : '$0.00'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isBalanced && (
        <p className="text-xs text-destructive text-right">
          The split amounts must equal the total expense amount.
        </p>
      )}
    </div>
  );
}
