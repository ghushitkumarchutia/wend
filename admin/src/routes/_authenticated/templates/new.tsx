/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { fetcher } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, ChevronLeft } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, Alert02Icon } from '@hugeicons/core-free-icons';
import { TemplateVisibility, CURRENCIES } from '@/types/enums';
import type { ApiResponse } from '@/types/api';
import type { Template } from '@/types/models';

export const Route = createFileRoute('/_authenticated/templates/new')({
  component: NewTemplatePage,
});

export function NewTemplatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [visibility, setVisibility] = useState<string>('draft');
  const [estimatedBudgetCurrency, setEstimatedBudgetCurrency] = useState<string>('USD');

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDestinationChange = (value: string) => {
    setDestination(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const queryValue = value.split(',')[0].trim();

    if (!queryValue || queryValue.length < 2) {
      setSuggestedImages([]);
      setIsLoadingPhotos(false);
      return;
    }

    setIsLoadingPhotos(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetcher<ApiResponse<string[]>>(
          `/v1/trips/photos?query=${encodeURIComponent(queryValue)}`
        );
        setSuggestedImages(res.data || []);
        if (res.data && res.data.length > 0) {
          setCoverImageUrl((prev) => prev || res.data[0]);
        }
      } catch {
        setSuggestedImages([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const categoriesArray = categories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (categoriesArray.length === 0) {
      const err = 'At least one category is required (comma-separated)';
      toast.error(err);
      setFormError(err);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetcher<ApiResponse<Template>>('/admin/templates', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          destination: destination.trim(),
          description: description.trim(),
          categories: categoriesArray,
          coverImageUrl: coverImageUrl || undefined,
          visibility,
          estimatedBudgetCurrency,
        }),
      });

      toast.success('Template initialized successfully');
      navigate({ to: '/templates/$templateId/edit', params: { templateId: res.data.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(msg);
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5 md:h-11 px-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs';
  const labelClass =
    'text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-16 font-manrope">
      <div>
        <Link
          to="/templates"
          className="inline-flex items-center text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
          Back to Templates
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold font-syne text-neutral-900 tracking-tight">
          Create New Template
        </h1>
        <p className="text-xs md:text-sm text-neutral-500 font-manrope mt-1">
          Set up the basic information to launch the template editor.
        </p>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[32px] border border-neutral-200/60 shadow-xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className={labelClass}>
              Title *
            </Label>
            <Input
              id="title"
              required
              placeholder="e.g. 7 Days in Kyoto & Osaka"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destination" className={labelClass}>
              Destination *
            </Label>
            <Input
              id="destination"
              required
              placeholder="e.g. Kyoto, Japan"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          {(suggestedImages.length > 0 || isLoadingPhotos) && (
            <div className="flex flex-col gap-1.5">
              <Label className={`${labelClass} flex items-center gap-1.5`}>
                <HugeiconsIcon
                  icon={Image01Icon}
                  className="size-4 text-neutral-500 shrink-0"
                  strokeWidth={1.75}
                />
                Suggested Cover Photos
              </Label>
              {isLoadingPhotos ? (
                <div className="flex items-center justify-center h-16 rounded-xl bg-neutral-50 border border-neutral-200/80 w-full">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 w-full">
                  {suggestedImages.slice(0, 4).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImageUrl(url)}
                      className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                        coverImageUrl === url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-neutral-200/80 hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Cover option ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {coverImageUrl === url && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className={labelClass}>
              Description *
            </Label>
            <Textarea
              id="description"
              required
              placeholder="A brief overview of what this trip template entails..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[110px] bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl p-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs resize-y"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categories" className={labelClass}>
              Categories * (comma separated)
            </Label>
            <Input
              id="categories"
              required
              placeholder="e.g. Nature, Adventure, Cultural"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            />
            <p className="text-[12px] text-neutral-400 font-manrope">
              At least one category is required. Separate multiple categories with commas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visibility" className={labelClass}>
                Initial Visibility
              </Label>
              <Select
                value={visibility}
                onValueChange={(val) => val && setVisibility(val)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl font-manrope">
                  {TemplateVisibility.map((v: string) => (
                    <SelectItem
                      key={v}
                      value={v}
                      className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency" className={labelClass}>
                Base Currency
              </Label>
              <Select
                value={estimatedBudgetCurrency}
                onValueChange={(val) => val && setEstimatedBudgetCurrency(val)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl font-manrope max-h-60 overflow-y-auto">
                  {CURRENCIES.map((code: string) => (
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
          </div>

          {formError && (
            <div className="p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-1 bg-white rounded-full shadow-xs border border-red-100 shrink-0">
                <HugeiconsIcon
                  icon={Alert02Icon}
                  className="h-4 w-4 text-red-600"
                  strokeWidth={1.75}
                />
              </div>
              <p className="text-xs md:text-[13.5px] leading-relaxed text-red-900/90 font-medium font-manrope">
                {formError}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => navigate({ to: '/templates' })}
              className="rounded-full h-11 px-5 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-manrope text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !destination || !description || !categories}
              className="relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-sm font-semibold text-white cursor-pointer select-none shrink-0 focus:outline-none transition-all duration-200 active:scale-[0.97] h-11 px-6 font-manrope border border-white/35 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(16, 185, 129, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                'Create & Continue to Editor'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
