import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete01Icon, Chart01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pollsApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface CreatePollFormProps {
  tripId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePollForm({ tripId, onSuccess, onCancel }: CreatePollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!question.trim()) {
      toast.error('Question is required');
      return;
    }

    if (validOptions.length < 2) {
      toast.error('At least 2 valid options are required');
      return;
    }

    if (new Set(validOptions).size !== validOptions.length) {
      toast.error('All options must be unique');
      return;
    }

    try {
      setIsSubmitting(true);
      await pollsApi.createPoll(tripId, {
        question: question.trim(),
        options: validOptions,
      });
      toast.success('Poll created');
      onSuccess();
    } catch {
      toast.error('Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 md:p-5 font-manrope space-y-4">
      <div className="flex items-center gap-2 pb-1">
        <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <HugeiconsIcon icon={Chart01Icon} className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <h4 className="font-syne font-bold text-sm text-neutral-900">Create New Poll</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="question" className="text-xs font-semibold text-neutral-700">
            Poll Question
          </Label>
          <Input
            id="question"
            placeholder="e.g. Where should we go for dinner tonight?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isSubmitting}
            className="h-9 text-xs md:text-sm font-manrope rounded-lg border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-neutral-700">Poll Options</Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  disabled={isSubmitting}
                  className="h-9 text-xs md:text-sm font-manrope rounded-lg border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 shrink-0 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer"
                  onClick={() => handleRemoveOption(i)}
                  disabled={options.length <= 2 || isSubmitting}
                  title="Remove Option"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            ))}
          </div>

          {options.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-9 py-2 mt-1.5 border-dashed border-neutral-300 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 rounded-lg text-xs font-medium font-manrope cursor-pointer transition-all"
              onClick={handleAddOption}
              disabled={isSubmitting}
            >
              <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              Add Option ({options.length}/10)
            </Button>
          )}
        </div>

        <div className="flex gap-2.5 md:gap-3 pt-2">
          <Button
            type="button"
            variant="waterdrop"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-9.5 rounded-full text-xs font-semibold font-manrope text-white border border-white/35 cursor-pointer transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                0 4px 14px -2px rgba(230, 57, 70, 0.4),
                0 1px 3px 0 rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !question.trim()}
            className="flex-1 h-9.5 rounded-full text-xs font-semibold font-manrope text-white border border-white/40 cursor-pointer transition-all disabled:opacity-50 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                0 4px 14px -2px rgba(16, 185, 129, 0.35)
              `,
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </form>
    </div>
  );
}
