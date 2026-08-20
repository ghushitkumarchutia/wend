import { Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, MultiplicationSignIcon } from '@hugeicons/core-free-icons';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? 20 : window.innerHeight - 80;
      setIsScrolled(window.scrollY >= threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-white border-b border-zinc-200/80 shadow-sm'
            : 'bg-transparent border-none'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between pl-6 pr-4.5 md:px-12">
          <div className="flex items-center w-auto md:w-64 justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <span
                className={`font-syne font-bold text-[22px] tracking-wide transition-colors duration-500 ${
                  isScrolled ? 'text-zinc-900' : 'text-white drop-shadow-sm'
                }`}
              >
                Wend.com
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center gap-8 md:gap-10">
            <Link
              to="/explore"
              className={`relative text-xs font-semibold font-manrope uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Destinations
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </Link>
            <a
              href="#about"
              className={`relative text-xs font-semibold font-manrope uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              About
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </a>
            <a
              href="#features"
              className={`relative text-xs font-semibold font-manrope uppercase tracking-wider transition-colors duration-500 group ${
                isScrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Features
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                  isScrolled ? 'bg-emerald-600' : 'bg-white'
                }`}
              />
            </a>
          </div>

          <div className="flex items-center justify-end w-auto md:w-64 gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/sign-in"
                className={`relative text-xs font-semibold font-manrope uppercase tracking-wider transition-colors duration-500 group ${
                  isScrolled
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out ${
                    isScrolled ? 'bg-emerald-600' : 'bg-white'
                  }`}
                />
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center rounded-full text-white text-xs font-semibold font-manrope uppercase tracking-wider px-5 py-2.5 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 shrink-0 border border-white/35 cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                    0 4px 14px -2px rgba(16, 185, 129, 0.4),
                    0 1px 3px 0 rgba(0, 0, 0, 0.08)
                  `,
                }}
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className={`md:hidden p-1.5 -mr-1 rounded-md transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isScrolled ? 'text-zinc-900 hover:text-zinc-700' : 'text-white/95 hover:text-white'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <HugeiconsIcon icon={Menu01Icon} className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed top-0 right-0 h-screen w-70 bg-white text-zinc-900 z-70 md:hidden transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
            <span className="font-syne font-bold text-[22px] tracking-wide text-zinc-900">
              Wend.com
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Close navigation menu"
            >
              <HugeiconsIcon icon={MultiplicationSignIcon} className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-col gap-6 pt-8">
            <Link
              to="/explore"
              onClick={handleClose}
              className="text-sm font-semibold font-manrope uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Destinations
            </Link>
            <a
              href="#about"
              onClick={handleClose}
              className="text-sm font-semibold font-manrope uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              About
            </a>
            <a
              href="#features"
              onClick={handleClose}
              className="text-sm font-semibold font-manrope uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Features
            </a>
            <Link
              to="/sign-in"
              onClick={handleClose}
              className="text-sm font-semibold font-manrope uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors border-t border-zinc-100 pt-4"
            >
              Sign In
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-100">
          <Link
            to="/sign-up"
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center rounded-full text-white text-sm font-semibold font-manrope uppercase tracking-wider py-3.5 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 border border-white/35 cursor-pointer"
            style={{
              background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                0 4px 14px -2px rgba(16, 185, 129, 0.4),
                0 1px 3px 0 rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
