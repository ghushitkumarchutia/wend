import { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  description: string;
  imageUrl: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: 'Kyoto, Japan',
    tag: 'CULTURAL IMMERSION',
    tagColor: 'text-emerald-400',
    description: 'Historic shrines & bamboo forests',
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&h=800&q=80',
  },
  {
    id: '2',
    name: 'Paris, France',
    tag: 'CITY BREAK',
    tagColor: 'text-pink-400',
    description: 'Boutique cafes and art tours',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&h=800&q=80',
  },
  {
    id: '3',
    name: 'Banff, Canada',
    tag: 'NATURE TREK',
    tagColor: 'text-sky-400',
    description: 'Alpine lakes & dramatic peaks',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=800&q=80',
  },
  {
    id: '4',
    name: 'Queenstown, NZ',
    tag: 'WILDERNESS TREK',
    tagColor: 'text-amber-400',
    description: 'Fiordland cruises & active glaciers',
    imageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&h=800&q=80',
  },
];

export function TripsCarouselSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const cardWidth = 320 + 24; // card width (320px) + gap (24px)
      const scrollTo = direction === 'left' ? scrollLeft - cardWidth : scrollLeft + cardWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-semibold text-zinc-900 leading-[1.15] tracking-tight">
              Not Your Boring <br className="hidden sm:inline" /> Travel Agent
            </h2>
            <p className="mt-5 text-sm sm:text-base text-zinc-500 font-light leading-relaxed max-w-md">
              We plan chill, curated trips with good vibes and better people. No rigid itineraries.
              Just flexible setups, local guides, and shared memories.
            </p>
            <button
              onClick={() => navigate({ to: '/sign-up' })}
              className="mt-8 px-6 py-3.5 bg-[#0b6646] hover:bg-[#095237] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              BOOK A SEAT
            </button>
          </div>

          <div className="lg:col-span-8 flex flex-col w-full relative">
            <div className="flex justify-end gap-2.5 mb-6">
              <button
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all focus:outline-none"
                aria-label="Previous destination"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all focus:outline-none"
                aria-label="Next destination"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pr-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {DESTINATIONS.map((destination) => (
                <div
                  key={destination.id}
                  className="w-[280px] sm:w-[320px] h-[380px] sm:h-[420px] shrink-0 rounded-3xl overflow-hidden relative snap-start group shadow-md"
                >
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent z-10" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col items-start text-left">
                    <span
                      className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-1.5 ${destination.tagColor}`}
                    >
                      {destination.tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 font-light tracking-wide">
                      {destination.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
