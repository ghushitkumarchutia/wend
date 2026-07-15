import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane } from 'lucide-react';

export interface FlightDetailsFormValues {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  confirmationRef?: string;
  terminal?: string;
  gate?: string;
  seat?: string;
  baggageAllowance?: string;
}

interface FlightDetailsFieldsProps {
  value: FlightDetailsFormValues;
  onChange: (value: FlightDetailsFormValues) => void;
  disabled?: boolean;
}

export function FlightDetailsFields({ value, onChange, disabled }: FlightDetailsFieldsProps) {
  const updateField = (field: keyof FlightDetailsFormValues, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const inputClass =
    'bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200';
  const labelClass = 'text-sm font-semibold text-neutral-900 tracking-wide select-none';

  return (
    <div className="space-y-3 pt-3 border-t border-neutral-200/60 mt-3">
      <h4 className="text-xs font-semibold text-[#09a474] uppercase tracking-wider flex items-center gap-1.5">
        <Plane className="h-3.5 w-3.5 stroke-1" />
        Flight Details
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="airline" className={labelClass}>
            Airline
          </Label>
          <Input
            id="airline"
            placeholder="e.g. Delta Airlines"
            value={value.airline || ''}
            onChange={(e) => updateField('airline', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="flightNumber" className={labelClass}>
            Flight Number
          </Label>
          <Input
            id="flightNumber"
            placeholder="e.g. DL123"
            value={value.flightNumber || ''}
            onChange={(e) => updateField('flightNumber', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="departureAirport" className={labelClass}>
            Departure Airport
          </Label>
          <Input
            id="departureAirport"
            placeholder="e.g. JFK"
            value={value.departureAirport || ''}
            onChange={(e) => updateField('departureAirport', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="arrivalAirport" className={labelClass}>
            Arrival Airport
          </Label>
          <Input
            id="arrivalAirport"
            placeholder="e.g. LAX"
            value={value.arrivalAirport || ''}
            onChange={(e) => updateField('arrivalAirport', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="terminal" className={labelClass}>
            Terminal
          </Label>
          <Input
            id="terminal"
            placeholder="e.g. T4"
            value={value.terminal || ''}
            onChange={(e) => updateField('terminal', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gate" className={labelClass}>
            Gate
          </Label>
          <Input
            id="gate"
            placeholder="e.g. B12"
            value={value.gate || ''}
            onChange={(e) => updateField('gate', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="seat" className={labelClass}>
            Seat
          </Label>
          <Input
            id="seat"
            placeholder="e.g. 12A"
            value={value.seat || ''}
            onChange={(e) => updateField('seat', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="confirmationRef" className={labelClass}>
            Confirmation Ref (PNR)
          </Label>
          <Input
            id="confirmationRef"
            placeholder="e.g. X7B9M"
            value={value.confirmationRef || ''}
            onChange={(e) => updateField('confirmationRef', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="baggageAllowance" className={labelClass}>
            Baggage
          </Label>
          <Input
            id="baggageAllowance"
            placeholder="e.g. 1 carry-on"
            value={value.baggageAllowance || ''}
            onChange={(e) => updateField('baggageAllowance', e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
