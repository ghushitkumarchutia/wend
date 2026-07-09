import { Link } from '@tanstack/react-router';

export function LandingNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
            Wend.com
          </span>
        </Link>
        <nav className="flex items-center gap-6 md:gap-8">
          <Link
            to="/explore"
            className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
          >
            Destinations
          </Link>
          <a
            href="#about"
            className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors hidden md:inline-block"
          >
            About
          </a>
          <a
            href="#features"
            className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors hidden md:inline-block"
          >
            Features
          </a>
          <Link
            to="/sign-in"
            className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-all shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
