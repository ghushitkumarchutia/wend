import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import type { TripWithRole } from '@/types/models';
import { format } from 'date-fns';

interface TripCardProps {
  trip: TripWithRole;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full overflow-hidden flex flex-col">
        <div className="relative h-40 w-full bg-muted">
          {trip.coverImageUrl ? (
            <img 
              src={trip.coverImageUrl} 
              alt={trip.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/50">
              <span className="text-4xl">✈️</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {trip.status}
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {trip.role}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="flex-none p-4 pb-2">
          <CardTitle className="line-clamp-1">{trip.name}</CardTitle>
          <CardDescription className="line-clamp-1">{trip.destination}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 pt-2 flex flex-col justify-end gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{trip.memberCount} traveler{trip.memberCount !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
