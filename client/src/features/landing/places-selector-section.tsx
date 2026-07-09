import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock, Compass, Calendar, ArrowRight } from 'lucide-react';

interface PlaceCardData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  tripType: string;
  dates: string;
  accommodation: string;
  transport: string;
  meals: string;
  price: string;
  currency: string;
  imageUrl: string;
}

const INDIAN_PLACES: PlaceCardData[] = [
  {
    id: 'in-1',
    title: 'Leh Ladakh Adventure',
    subtitle: 'Ladakh, Himalayas',
    duration: '6 Days',
    tripType: 'Group Trip',
    dates: '10-16 Aug',
    accommodation: 'Homestays & High Camps',
    transport: 'Private 4x4 Off-Roaders',
    meals: 'All Mountain Meals Included',
    price: '34,500',
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&h=450&q=80',
  },
  {
    id: 'in-2',
    title: 'Kerala Tea Estate Escape',
    subtitle: 'Munnar, Kerala',
    duration: '5 Days',
    tripType: 'Relaxed Retreat',
    dates: '04-09 Sep',
    accommodation: 'Boutique Luxury Resort',
    transport: 'Private AC Sedan',
    meals: 'Daily Breakfast & Dinner',
    price: '27,800',
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&h=450&q=80',
  },
  {
    id: 'in-3',
    title: 'Varkala Surf & Yoga',
    subtitle: 'Varkala, Kerala',
    duration: '6 Days',
    tripType: 'Surf & Mindfulness',
    dates: '12-18 Oct',
    accommodation: 'Oceanfront Cottages',
    transport: 'Rental Scooters & Airport Cab',
    meals: 'Organic Breakfast & Beverages',
    price: '23,500',
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&h=450&q=80',
  },
];

const ABROAD_PLACES: PlaceCardData[] = [
  {
    id: 'ab-1',
    title: 'Kyoto Temple Lodge',
    subtitle: 'Kyoto, Japan',
    duration: '7 Days',
    tripType: 'Group Trip',
    dates: '05-12 Sep',
    accommodation: '3N Ryokan, 3N Boutique',
    transport: 'Shinkansen Transit Passes',
    meals: 'Breakfast & Kaiseki Dinners',
    price: '2,400',
    currency: '$',
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&h=450&q=80',
  },
  {
    id: 'ab-2',
    title: 'Paris Art & Cafes',
    subtitle: 'Paris, France',
    duration: '6 Days',
    tripType: 'Bespoke Tour',
    dates: '14-20 Sep',
    accommodation: 'Boutique Hotel in Marais',
    transport: 'Metro Passes & Seine Cruise',
    meals: 'Daily French Pastry & Dinner',
    price: '1,950',
    currency: '$',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&h=450&q=80',
  },
  {
    id: 'ab-3',
    title: 'Queenstown Alpine Escape',
    subtitle: 'Queenstown, New Zealand',
    duration: '8 Days',
    tripType: 'Active Explorer',
    dates: '10-18 Oct',
    accommodation: 'Lakefront Lodge & Chalet',
    transport: 'Rental SUV Included',
    meals: 'Daily Mountain Lunches',
    price: '2,850',
    currency: '$',
    imageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&h=450&q=80',
  },
];

export function PlacesSelectorSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'india' | 'abroad'>('india');

  const places = activeTab === 'india' ? INDIAN_PLACES : ABROAD_PLACES;

  return (
    <section className="bg-zinc-50/50 py-16 md:py-24 border-t border-zinc-100/80">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
            Pick the Place
          </h2>

          <div className="bg-zinc-100/80 p-1 flex rounded-full w-fit border border-zinc-200/50">
            <button
              onClick={() => setActiveTab('india')}
              className={`font-semibold uppercase text-xs tracking-wider px-6 py-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                activeTab === 'india'
                  ? 'bg-[#0b6646] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              India
            </button>
            <button
              onClick={() => setActiveTab('abroad')}
              className={`font-semibold uppercase text-xs tracking-wider px-6 py-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                activeTab === 'abroad'
                  ? 'bg-[#0b6646] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Abroad
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {places.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-[32px] border border-zinc-200/80 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tight leading-snug">
                    {place.title}
                  </h3>
                  <span className="text-xs text-zinc-400 font-normal mt-1">{place.subtitle}</span>
                </div>

                <div className="relative w-full h-[200px] sm:h-[220px] rounded-[24px] overflow-hidden mt-5">
                  <img
                    src={place.imageUrl}
                    alt={place.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent z-10" />

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-black/60 backdrop-blur-md rounded-full py-2 px-3.5 text-white text-[10px] sm:text-xs flex items-center justify-between font-medium select-none z-20 shadow-lg border border-white/10">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>{place.duration}</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>{place.tripType}</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>{place.dates}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-5 border-b border-zinc-100/80 text-left mt-1 select-none">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Accommodation</span>
                    <span className="text-zinc-950 font-semibold text-right">
                      {place.accommodation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Transport</span>
                    <span className="text-zinc-950 font-semibold text-right">
                      {place.transport}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Meals</span>
                    <span className="text-zinc-950 font-semibold text-right">{place.meals}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 mt-auto">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Starting At
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-zinc-950 mt-0.5">
                    {place.currency}
                    {place.price}
                    <span className="text-xs text-zinc-400 font-light ml-1">/ person</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate({ to: '/sign-up' })}
                  className="w-11 h-11 rounded-full bg-[#0b6646] hover:bg-[#095237] text-white flex items-center justify-center transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] shadow-sm hover:shadow-md cursor-pointer focus:outline-none"
                  aria-label={`Book ${place.title}`}
                >
                  <ArrowRight className="h-5 w-5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
