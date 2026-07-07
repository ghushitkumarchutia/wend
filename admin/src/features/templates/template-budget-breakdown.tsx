import { useTemplateFormStore } from '@/stores/template-form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export function TemplateBudgetBreakdown() {
  const data = useTemplateFormStore((state) => state.data);
  const updateBudget = useTemplateFormStore((state) => state.updateBudget);

  const breakdown = data.estimatedBudgetBreakdown || {};
  const entries = Object.entries(breakdown);

  const handleUpdateKey = (oldKey: string, newKey: string, val: number) => {
    if (oldKey === newKey) return;
    const newBreakdown = { ...breakdown };
    delete newBreakdown[oldKey];
    if (newKey) newBreakdown[newKey] = val;
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  const handleUpdateVal = (key: string, val: number) => {
    const newBreakdown = { ...breakdown, [key]: val };
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  const handleRemove = (key: string) => {
    const newBreakdown = { ...breakdown };
    delete newBreakdown[key];
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  const handleAdd = () => {
    const newBreakdown = { ...breakdown, [`Item ${entries.length + 1}`]: 0 };
    updateBudget({ estimatedBudgetBreakdown: newBreakdown });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency Code</Label>
        <Input
          id="currency"
          placeholder="e.g. USD, EUR, INR"
          className="w-[200px]"
          value={data.estimatedBudgetCurrency || ''}
          onChange={(e) => updateBudget({ estimatedBudgetCurrency: e.target.value.toUpperCase() })}
        />
      </div>

      <div className="space-y-4">
        <Label>Estimated Breakdown</Label>
        
        {entries.map(([key, val], index) => (
          <div key={index} className="flex items-center gap-4">
            <Input
              value={key}
              onChange={(e) => handleUpdateKey(key, e.target.value, val)}
              placeholder="Expense category (e.g. Flights)"
              className="flex-1"
            />
            <Input
              type="number"
              min={0}
              value={val || ''}
              onChange={(e) => handleUpdateVal(key, parseInt(e.target.value, 10) || 0)}
              placeholder="Amount"
              className="w-[150px]"
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemove(key)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
