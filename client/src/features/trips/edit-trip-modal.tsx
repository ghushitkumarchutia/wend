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
import { Calendar as CalendarIcon, ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
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
        className="sm:max-w-[480px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
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
        <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
          Edit Trip Details
        </DialogTitle>
        <DialogDescription className="text-sm text-neutral-400 font-light text-center">
          Update your trip's name, dates, budget, or cover photo.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2 py-0 mt-3">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="edit-name"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Trip Name
          </Label>
          <Input
            id="edit-name"
            placeholder="e.g. Summer in Japan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="edit-destination"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Destination
          </Label>
          <Input
            id="edit-destination"
            placeholder="e.g. Tokyo, Kyoto, Osaka"
            value={destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
            required
          />
        </div>

        {(suggestedImages.length > 0 || isLoadingPhotos) && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-neutral-900 tracking-wide select-none flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
              Cover Photo
            </Label>
            {isLoadingPhotos ? (
              <div className="flex items-center justify-center h-[56px] rounded-xl bg-[#F6F6F6] border border-neutral-200/60 w-full">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
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
                        ? 'border-[#09a474] ring-2 ring-[#09a474]/20 shadow-sm'
                        : 'border-neutral-200/60 hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Cover option ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {coverImageUrl === url && (
                      <div className="absolute inset-0 bg-[#09a474]/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#09a474] flex items-center justify-center">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="edit-startDate"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#F6F6F6] hover:bg-[#f1f3f5] border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 text-left flex items-center justify-between cursor-pointer!"
                >
                  <span className={startDate ? 'text-neutral-900' : 'text-neutral-400'}>
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent"
                align="start"
              >
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="edit-endDate"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              End Date
            </Label>
            <Popover>
              <PopoverTrigger className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!startDate}
                  className="w-full bg-[#F6F6F6] hover:bg-[#f1f3f5] border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 text-left flex items-center justify-between cursor-pointer! disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={endDate ? 'text-neutral-900' : 'text-neutral-400'}>
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent"
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
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="edit-baseCurrency"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
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
                className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
                {CURRENCIES.map((currency) => (
                  <SelectItem
                    key={currency}
                    value={currency}
                    className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                      currency === baseCurrency
                        ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                        : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                    }`}
                  >
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="edit-estimatedBudget"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              Budget (Optional)
            </Label>
            <Input
              id="edit-estimatedBudget"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. $2000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
      {formError && (
        <div className="mt-4 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 bg-white rounded-full shadow-sm border border-red-100">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-[13.5px] leading-relaxed text-red-900/90 font-medium">{formError}</p>
        </div>
      )}
      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onClose}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name || !destination || !startDate || !endDate}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
