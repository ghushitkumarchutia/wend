import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="border-primary/20 shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="e.g. Where should we go for dinner?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveOption(i)}
                  disabled={options.length <= 2 || isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleAddOption}
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Option
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !question.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Poll
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
