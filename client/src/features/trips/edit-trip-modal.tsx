import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tripApi, tripsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, Calendar02Icon } from '@hugeicons/core-free-icons';
import { CURRENCIES } from '@/types/enums';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { TripWithRole } from '@/types/models';

interface EditTripModalProps {
  trip: TripWithRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripModal({ trip, open, onOpenChange }: EditTripModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="md:max-w-120 rounded-3xl md:rounded-[32px] bg-white pt-5 pb-6 px-6 md:pt-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto font-manrope"
      >
        {open && <EditTripForm trip={trip} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface EditTripFormProps {
  trip: TripWithRole;
  onClose: () => void;
}

function EditTripForm({ trip, onClose }: EditTripFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState<Date | undefined>(
    trip.startDate ? new Date(trip.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    trip.endDate ? new Date(trip.endDate) : undefined,
  );
  const [baseCurrency, setBaseCurrency] = useState(trip.baseCurrency || 'USD');
  const [estimatedBudget, setEstimatedBudget] = useState(
    trip.estimatedBudget !== undefined && trip.estimatedBudget !== null
      ? String(trip.estimatedBudget)
      : '',
  );
  const initialQuery = trip.destination ? trip.destination.split(',')[0].trim() : '';
  const hasInitialPhotos = initialQuery.length >= 2;

  const [coverImageUrl, setCoverImageUrl] = useState(trip.coverImageUrl || '');
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(hasInitialPhotos);
  const [formError, setFormError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hasInitialPhotos) {
      let isCancelled = false;
      tripsApi
        .getPhotos(initialQuery)
        .then((res) => {
          if (!isCancelled) setSuggestedImages(res.data);
        })
        .catch(() => {
          if (!isCancelled) setSuggestedImages([]);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingPhotos(false);
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [hasInitialPhotos, initialQuery]);

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
        const res = await tripsApi.getPhotos(queryValue);
        setSuggestedImages(res.data);
      } catch {
        setSuggestedImages([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    }, 600);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate && endDate < date) {
      setEndDate(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) return;

    setFormError(null);

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        baseCurrency,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        coverImageUrl: coverImageUrl || null,
      };

      await tripApi.updateTrip(trip.id, payload);
      toast.success('Trip details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update trip.';
      toast.error(msg);
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
        <DialogTitle className="text-xl md:text-2xl font-bold text-[#10b981] font-syne text-center tracking-tight">
          Edit Trip Details
        </DialogTitle>
        <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed">
          Update your trip's name, dates, budget, or cover photo.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3.5 py-0 mt-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-name"
            className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
          >
            Trip Name
          </Label>
          <Input
            id="edit-name"
            placeholder="e.g. Summer in Japan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-neutral-900 placeholder:text-neutral-400 transition-all duration-200"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-destination"
            className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
          >
            Destination
          </Label>
          <Input
            id="edit-destination"
            placeholder="e.g. Tokyo, Kyoto, Osaka"
            value={destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-neutral-900 placeholder:text-neutral-400 transition-all duration-200"
            required
          />
        </div>

        {(suggestedImages.length > 0 || isLoadingPhotos) && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none flex items-center gap-1.5">
              <HugeiconsIcon
                icon={Image01Icon}
                className="size-4 text-neutral-500 shrink-0"
                strokeWidth={1.75}
              />
              Cover Photo
            </Label>
            {isLoadingPhotos ? (
              <div className="flex items-center justify-center h-14 rounded-xl bg-[#F5F5F7] border border-neutral-200/80 w-full">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 md:gap-2 w-full">
                {suggestedImages.slice(0, 4).map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImageUrl(url)}
                    className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                      coverImageUrl === url
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
                    {coverImageUrl === url && (
                      <div className="absolute inset-0 bg-[#10b981]/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="edit-startDate"
              className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
            >
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger
                type="button"
                className="w-full bg-[#F5F5F7] hover:bg-[#EEEEEF] border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-3 md:px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 text-left flex items-center justify-between cursor-pointer!"
              >
                <span
                  className={`truncate pr-1 ${
                    startDate ? 'text-neutral-900 font-medium' : 'text-neutral-400'
                  }`}
                >
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}
                </span>
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  className="size-4 text-neutral-400 shrink-0"
                  strokeWidth={1.75}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent z-50 font-manrope"
                align="start"
              >
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="edit-endDate"
              className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
            >
              End Date
            </Label>
            <Popover>
              <PopoverTrigger
                type="button"
                disabled={!startDate}
                className="w-full bg-[#F5F5F7] hover:bg-[#EEEEEF] border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-3 md:px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 text-left flex items-center justify-between cursor-pointer! disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className={`truncate pr-1 ${endDate ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}
                >
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}
                </span>
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  className="size-4 text-neutral-400 shrink-0"
                  strokeWidth={1.75}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent z-50 font-manrope"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={startDate ? { before: startDate } : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="edit-baseCurrency"
              className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
            >
              Base Currency
            </Label>
            <Select
              value={baseCurrency}
              onValueChange={(val) => val && setBaseCurrency(val)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="edit-baseCurrency"
                className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5! md:h-11! px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 w-full cursor-pointer! flex items-center justify-between"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                sideOffset={8}
                align="start"
                alignItemWithTrigger={false}
                className="w-full min-w-(--radix-select-trigger-width) bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl p-2 overflow-y-auto ring-transparent z-50 mt-1 max-h-56 font-manrope"
              >
                {CURRENCIES.map((currency) => {
                  const isSelected = currency === baseCurrency;
                  return (
                    <SelectItem
                      key={currency}
                      value={currency}
                      className={`rounded-lg transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 font-manrope text-sm font-medium ${
                        isSelected
                          ? 'text-white! hover:text-white! focus:text-white! focus:bg-[#059669]! hover:bg-[#059669]! **:text-white! hover:**:text-white! focus:**:text-white! font-semibold border border-white/30'
                          : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                      }`}
                      style={
                        isSelected
                          ? {
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              boxShadow: `
                                inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4),
                                inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2),
                                0 3px 10px -1px rgba(16, 185, 129, 0.35)
                              `,
                            }
                          : undefined
                      }
                    >
                      {currency}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="edit-estimatedBudget"
              className="text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none"
            >
              Budget (Optional)
            </Label>
            <Input
              id="edit-estimatedBudget"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
      {formError && (
        <div className="mt-4 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 bg-white rounded-full shadow-xs border border-red-100">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-xs md:text-[13.5px] leading-relaxed text-red-900/90 font-medium font-manrope">
            {formError}
          </p>
        </div>
      )}
      <div className="flex gap-2.5 md:gap-3 mt-6">
        <Button
          type="button"
          variant="waterdrop"
          disabled={isSubmitting}
          onClick={onClose}
          className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer"
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
          variant="waterdrop"
          disabled={isSubmitting || !name || !destination || !startDate || !endDate}
          className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
