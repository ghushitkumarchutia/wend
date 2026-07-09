import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight - 80;
      if (window.scrollY >= threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-white border-b border-zinc-200/80 shadow-sm'
            : 'bg-transparent border-none'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
          <div className="flex items-center w-48 md:w-64 justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <span
                className={`font-medium text-[22px] tracking-wide transition-colors duration-500 ${
                  isScrolled ? 'text-zinc-900' : 'text-white drop-shadow-sm'
                }`}
              >
                Wend.com
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-10">
            <Link
              to="/explore"
              className={`relative text-xs font-semibold uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Destinations
              <span
                className={`absolute -bottom-1 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </Link>
            <a
              href="#about"
              className={`relative text-xs font-semibold uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              About
              <span
                className={`absolute -bottom-1 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </a>
            <a
              href="#features"
              className={`relative text-xs font-semibold uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Features
              <span
                className={`absolute -bottom-1 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </a>
          </div>

          <div className="flex items-center justify-end w-48 md:w-64 gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/sign-in"
                className={`relative text-xs font-semibold uppercase tracking-wider transition-colors duration-500 group ${
                  isScrolled
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                    isScrolled ? 'bg-emerald-600' : 'bg-white'
                  }`}
                />
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 shrink-0"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-1.5 rounded-md text-white/95 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Toggle menu"
            >
              <Menu
                className={`h-6 w-6 transition-colors duration-500 ${
                  isScrolled ? 'text-zinc-900' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 md:hidden transition-opacity duration-300"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-[280px] bg-white text-zinc-900 z-70 md:hidden transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
            <span className="font-medium text-[22px] tracking-wide text-zinc-900">Wend.com</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 pt-8">
            <Link
              to="/explore"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Destinations
            </Link>
            <a
              href="#about"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              About
            </a>
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Features
            </a>
            <Link
              to="/sign-in"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors border-t border-zinc-100 pt-4"
            >
              Sign In
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-100">
          <Link
            to="/sign-up"
            onClick={() => setIsOpen(false)}
            className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold uppercase tracking-wider py-3.5 transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
