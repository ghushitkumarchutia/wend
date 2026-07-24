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
  currency?: string;
}

export function SplitMethodFields({
  tripId,
  totalAmount,
  splitMethod,
  value,
  onChange,
  disabled,
  currency = 'USD',
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
    return (
      <div className="text-xs md:text-sm font-manrope text-neutral-500">
        Loading participants...
      </div>
    );
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
    <div className="space-y-3 pt-4 border-t border-neutral-200/60 mt-2">
      <div className="flex justify-between items-center">
        <h4 className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide">
          Split Details
        </h4>
        <span
          className={`text-xs md:text-sm font-semibold font-syne ${isBalanced ? 'text-[#10b981]' : 'text-red-500'}`}
        >
          {formatCurrency(currentTotal, currency)} / {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const share = value.find((s) => s.userId === member.userId);
          if (!share) return null;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-[#F5F5F7] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Checkbox
                  id={`split-${member.userId}`}
                  checked={share.isSelected}
                  onCheckedChange={(checked) => handleToggle(member.userId, checked as boolean)}
                  disabled={disabled}
                  className="border-neutral-300 data-[state=checked]:bg-[#10b981] data-[state=checked]:border-[#10b981] shrink-0"
                />
                <Label
                  htmlFor={`split-${member.userId}`}
                  className="cursor-pointer font-medium font-manrope text-xs md:text-sm text-neutral-900 truncate"
                >
                  {member.user?.name || member.user?.email || 'Unknown'}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                {share.isSelected && splitMethod !== 'equal' && (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      step={splitMethod === 'unequal' ? '0.01' : '1'}
                      min="0"
                      className="h-9 w-24 text-left px-3 bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200"
                      placeholder={
                        splitMethod === 'unequal'
                          ? '0.00'
                          : splitMethod === 'percentage'
                            ? '0'
                            : '1'
                      }
                      value={share.inputValue}
                      onChange={(e) => handleInputChange(member.userId, e.target.value)}
                      disabled={disabled}
                    />
                    {splitMethod !== 'unequal' && (
                      <span className="text-xs text-neutral-400 font-manrope shrink-0 select-none">
                        {splitMethod === 'percentage' ? '%' : 'sh'}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-sm font-semibold font-syne text-neutral-900 min-w-18 text-right">
                  {share.isSelected
                    ? formatCurrency(share.shareAmount, currency)
                    : formatCurrency(0, currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isBalanced && (
        <p className="text-xs text-red-500 text-right font-manrope">
          The split amounts must equal the total expense amount.
        </p>
      )}
    </div>
  );
}
