import { useState, useRef } from 'react';
import { useTemplateFormStore } from '@/stores/template-form-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';
import { fetcher } from '@/lib/api-client';
import { Loader2, Check } from 'lucide-react';
import type { ApiResponse } from '@/types/api';

export function TemplateGeneralInfo() {
  const data = useTemplateFormStore((state) => state.data);
  const updateGeneralInfo = useTemplateFormStore((state) => state.updateGeneralInfo);

  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputClass =
    'bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5 md:h-11 px-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs';
  const labelClass =
    'text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none';

  const handleDestinationChange = (value: string) => {
    updateGeneralInfo({ destination: value });

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
          `/v1/trips/photos?query=${encodeURIComponent(queryValue)}`,
        );
        setSuggestedImages(res.data || []);
        if (res.data && res.data.length > 0 && !data.coverImageUrl) {
          updateGeneralInfo({ coverImageUrl: res.data[0] });
        }
      } catch {
        setSuggestedImages([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title" className={labelClass}>
            Template Title
          </Label>
          <Input
            id="title"
            placeholder="e.g. 7 Days in Kyoto"
            value={data.title || ''}
            onChange={(e) => updateGeneralInfo({ title: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destination" className={labelClass}>
            Destination
          </Label>
          <Input
            id="destination"
            placeholder="e.g. Kyoto, Japan"
            value={data.destination || ''}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className={inputClass}
          />
        </div>

        {(suggestedImages.length > 0 || isLoadingPhotos || data.coverImageUrl) && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none flex items-center gap-1.5">
              <HugeiconsIcon
                icon={Image01Icon}
                className="size-4 text-neutral-500 shrink-0"
                strokeWidth={1.75}
              />
              Cover Photo Suggestions
            </Label>
            {isLoadingPhotos ? (
              <div className="flex items-center justify-center h-14 rounded-xl bg-[#F5F5F7] border border-neutral-200/80 w-full">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : suggestedImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5 md:gap-2 w-full">
                {suggestedImages.slice(0, 4).map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateGeneralInfo({ coverImageUrl: url })}
                    className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                      data.coverImageUrl === url
                        ? 'border-[#10b981] ring-2 ring-[#10b981]/20 shadow-xs'
                        : 'border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Cover option ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {data.coverImageUrl === url && (
                      <div className="absolute inset-0 bg-[#10b981]/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coverUrl" className={labelClass}>
            Custom Cover Image URL
          </Label>
          <Input
            id="coverUrl"
            placeholder="https://..."
            value={data.coverImageUrl || ''}
            onChange={(e) => updateGeneralInfo({ coverImageUrl: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description" className={labelClass}>
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Write a brief overview of the trip..."
            className="min-h-35 bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl p-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs resize-y"
            value={data.description || ''}
            onChange={(e) => updateGeneralInfo({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
