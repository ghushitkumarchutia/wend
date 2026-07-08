import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  return (
    <div className="space-y-4 pt-4 border-t mt-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Flight Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="airline">Airline</Label>
          <Input
            id="airline"
            placeholder="e.g. Delta Airlines"
            value={value.airline || ''}
            onChange={(e) => updateField('airline', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flightNumber">Flight Number</Label>
          <Input
            id="flightNumber"
            placeholder="e.g. DL123"
            value={value.flightNumber || ''}
            onChange={(e) => updateField('flightNumber', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureAirport">Departure Airport</Label>
          <Input
            id="departureAirport"
            placeholder="e.g. JFK"
            value={value.departureAirport || ''}
            onChange={(e) => updateField('departureAirport', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalAirport">Arrival Airport</Label>
          <Input
            id="arrivalAirport"
            placeholder="e.g. LAX"
            value={value.arrivalAirport || ''}
            onChange={(e) => updateField('arrivalAirport', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="terminal">Terminal</Label>
          <Input
            id="terminal"
            placeholder="e.g. T4"
            value={value.terminal || ''}
            onChange={(e) => updateField('terminal', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gate">Gate</Label>
          <Input
            id="gate"
            placeholder="e.g. B12"
            value={value.gate || ''}
            onChange={(e) => updateField('gate', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seat">Seat</Label>
          <Input
            id="seat"
            placeholder="e.g. 12A"
            value={value.seat || ''}
            onChange={(e) => updateField('seat', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="confirmationRef">Confirmation Ref (PNR)</Label>
          <Input
            id="confirmationRef"
            placeholder="e.g. X7B9M"
            value={value.confirmationRef || ''}
            onChange={(e) => updateField('confirmationRef', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baggageAllowance">Baggage</Label>
          <Input
            id="baggageAllowance"
            placeholder="e.g. 1 carry-on, 1 checked"
            value={value.baggageAllowance || ''}
            onChange={(e) => updateField('baggageAllowance', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
