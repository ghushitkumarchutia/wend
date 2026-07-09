import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import heroBg from '@/assets/images/hero.jpg';

export function HeroSection() {
  const navigate = useNavigate();

  const destinations = useState([
    'Paris',
    'Tokyo',
    'Bali',
    'Rome',
    'London',
    'Switzerland',
    'New York',
  ])[0];
  const [destIndex, setDestIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentDest = destinations[destIndex];
    let timerSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === currentDest.length) {
      timerSpeed = 1800;
    } else if (isDeleting && charIndex === 0) {
      timerSpeed = 500;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex === currentDest.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setDestIndex((prev) => (prev + 1) % destinations.length);
      } else {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }
    }, timerSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, destIndex, destinations]);

  const typedText = destinations[destIndex].substring(0, charIndex);

  const handleStartPlanning = () => {
    navigate({ to: '/sign-up' });
  };

  return (
    <section
      className="relative w-full h-[85vh] min-h-[650px] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-black/35 z-10" />

      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent z-25" />

      <div className="container relative z-30 px-6 md:px-12 mx-auto flex flex-col items-center text-center mt-12 md:mt-16">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-4xl leading-tight">
          Build Your Perfect <br className="hidden sm:inline" /> Travel Itinerary
        </h1>

        <p className="mt-6 max-w-2xl text-base md:text-xl text-white/90 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] leading-relaxed">
          Collaboratively build day-by-day itineraries, budget tracking, polls and group chat. All
          in one beautifully unified workspace.
        </p>

        <div
          onClick={handleStartPlanning}
          className="mt-10 flex items-center w-full max-w-2xl bg-white/95 backdrop-blur rounded-full p-1.5 shadow-2xl border border-white/20 hover:bg-white transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 pl-4 flex-1">
            <Search className="h-5 w-5 text-muted-foreground group-hover:scale-105 transition-transform" />
            <div className="text-sm md:text-base text-left text-foreground font-medium select-none">
              <span className="text-muted-foreground">Explore </span>
              <span className="text-foreground border-r-2 border-emerald-600 animate-pulse pr-0.5">
                {typedText}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartPlanning();
            }}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-6 py-2.5 text-sm font-semibold tracking-wider transition-colors shadow-md hover:shadow-lg"
          >
            + ADD TRIP
          </button>
        </div>
      </div>
    </section>
  );
}
