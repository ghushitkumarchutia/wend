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

  const breakdown = data.estimatedBudgetBreakdown ?? {
    accommodation: 0,
    transport: 0,
    foodAndDrinks: 0,
    activities: 0,
    miscellaneous: 0,
  };

  const handleUpdateAmount = (key: string, val: number) => {
    const newBreakdown = { ...breakdown, [key]: val };
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  const inputClass =
    'bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5 md:h-11 px-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs';
  const labelClass =
    'text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1.5 max-w-sm">
        <Label htmlFor="currency" className={labelClass}>
          Base Currency
        </Label>
        <Select
          value={data.estimatedBudgetCurrency ?? ''}
          onValueChange={(val) => val && updateBudget({ estimatedBudgetCurrency: val })}
        >
          <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl font-manrope max-h-60 overflow-y-auto">
            {CURRENCIES.map((code) => (
              <SelectItem
                key={code}
                value={code}
                className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
              >
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-base font-bold font-syne text-neutral-900">
            Estimated Breakdown
          </Label>
          <p className="text-[13px] text-neutral-500 font-manrope mt-1">
            Enter estimated costs per category for this trip template.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BUDGET_CATEGORIES.map(({ key, label }) => (
            <div
              key={key}
              className="flex flex-col gap-1.5 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100"
            >
              <Label className={labelClass}>{label}</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm">
                  {data.estimatedBudgetCurrency || '$'}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={breakdown[key] ?? ''}
                  onChange={(e) => handleUpdateAmount(key, parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
