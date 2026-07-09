import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import heroBg from '@/assets/images/hero.jpg';

export function HeroSection() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      className="relative w-full h-[70vh] min-h-[480px] md:h-screen md:min-h-[650px] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-black/35 z-10" />

      <div className="container relative z-30 px-4 md:px-12 mx-auto flex flex-col items-center text-center mt-12 md:mt-16">
        <h1 className="text-[38px] md:text-7xl lg:text-[86px] font-medium tracking-tight text-white max-w-4xl leading-tight sm:leading-none">
          Build Your Perfect <br /> Travel Itinerary
        </h1>

        <p className="mt-3 max-w-[360px] sm:max-w-2xl text-[12px] sm:text-base lg:text-lg text-white/90 font-normal leading-relaxed">
          Collaboratively build day-by-day itineraries, budget tracking,
          <br className="sm:hidden" /> polls and group chat. All in one beautifully unified
          workspace.
        </p>

        <div className="mt-8 sm:mt-10 flex items-center w-full max-w-[360px] sm:max-w-2xl bg-white/95 backdrop-blur rounded-full p-1 sm:p-1.5 shadow-2xl border border-white/20 hover:bg-white transition-all cursor-default group">
          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 flex-1 relative h-8 sm:h-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:scale-105 transition-transform shrink-0" />

            <div className="relative flex-1 h-full flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, 45))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-[13px] sm:text-base text-foreground font-medium placeholder-zinc-400 relative z-20 cursor-text"
                placeholder={isFocused ? 'Where would you like to go?' : ''}
                maxLength={45}
              />

              {!isFocused && !inputValue && (
                <div className="absolute inset-0 flex items-center pointer-events-none z-10 text-[13px] sm:text-base text-left text-foreground font-medium select-none">
                  <span className="text-muted-foreground">Explore </span>
                  <span className="text-foreground border-r-2 border-emerald-600 animate-pulse pr-0.5 ml-1">
                    {typedText}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStartPlanning}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold tracking-wider transition-colors shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            + ADD TRIP
          </button>
        </div>
      </div>
    </section>
  );
}
