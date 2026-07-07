import { useTemplateFormStore } from '@/stores/template-form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUDGET_CATEGORIES, CURRENCIES } from '@/types/enums';

export function TemplateBudgetBreakdown() {
  const data = useTemplateFormStore((state) => state.data);
  const updateBudget = useTemplateFormStore((state) => state.updateBudget);

  const breakdown = data.estimatedBudgetBreakdown ?? {};

  const handleUpdateAmount = (key: string, val: number) => {
    const newBreakdown = { ...breakdown, [key]: val };
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={data.estimatedBudgetCurrency ?? ''}
          onValueChange={(val) => val && updateBudget({ estimatedBudgetCurrency: val })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Estimated Breakdown</Label>
        <p className="text-xs text-muted-foreground">
          Enter estimated costs per category for this trip template.
        </p>

        {BUDGET_CATEGORIES.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <Label className="w-[160px] text-sm shrink-0">{label}</Label>
            <Input
              type="number"
              min={0}
              value={breakdown[key] ?? ''}
              onChange={(e) => handleUpdateAmount(key, parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-[180px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
