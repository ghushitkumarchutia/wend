import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { tripApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { CURRENCIES } from '@/types/enums';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export function CreateTripModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [estimatedBudget, setEstimatedBudget] = useState('');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setName('');
      setDestination('');
      setStartDate(undefined);
      setEndDate(undefined);
      setBaseCurrency('USD');
      setEstimatedBudget('');
    }
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

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        baseCurrency,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
      };

      const res = await tripApi.createTrip(payload);
      toast.success('Trip created successfully!');
      setIsOpen(false);

      router.navigate({ to: `/trips/${res.data.trip.id}` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create trip.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 bg-[#09a474] hover:bg-[#088f65] text-white shadow-sm h-10 px-4 cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        New Trip
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[420px] rounded-[32px] bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
            <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
              Create New Trip
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400 font-light text-center">
              Start planning your next adventure.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-0 mt-3">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
              >
                Trip Name
              </Label>
              <Input
                id="name"
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
                htmlFor="destination"
                className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
              >
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g. Tokyo, Kyoto, Osaka"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isSubmitting}
                className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="startDate"
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
                  htmlFor="endDate"
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
                  htmlFor="baseCurrency"
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
                    id="baseCurrency"
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
                  htmlFor="estimatedBudget"
                  className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
                >
                  Budget (Optional)
                </Label>
                <Input
                  id="estimatedBudget"
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
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
              className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || !destination || !startDate || !endDate}
              className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
