import { Link } from '@tanstack/react-router';

export function LandingFooter() {
  return (
    <footer className="relative bg-[#084d34] text-white pt-16 pb-8 overflow-hidden select-none border-t border-emerald-950/20">
      <div className="relative z-20 w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16 flex flex-col">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-12 border-b border-emerald-800/40">
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Get travel inspiration & tips
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed max-w-lg">
              Subscribe to our newsletter for hand-curated itineraries, local explorer guides, and early platform updates.
            </p>
          </div>

          <div className="relative w-full max-w-md flex items-center">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-emerald-950/20 text-white placeholder-emerald-100/30 text-xs sm:text-sm border border-emerald-500/20 rounded-full py-3.5 pl-6 pr-32 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent transition-all"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white hover:bg-emerald-50 active:scale-95 text-[#084d34] font-bold text-xs tracking-wider px-5 py-2.5 rounded-full uppercase transition-all shadow-sm cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 py-16 text-left">
          
          <div className="col-span-2 md:col-span-5 flex flex-col items-start pr-0 md:pr-12">
            <span className="font-bold text-2xl tracking-tight text-white">
              Wend.com
            </span>
            <p className="mt-4 text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed max-w-sm">
              Empowering groups to plan, coordinate, and experience travel together. Beautiful, unified workspaces designed with absolute precision.
            </p>
            
            <div className="flex items-center gap-3.5 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-emerald-700/50 flex items-center justify-center text-emerald-100/70 hover:text-white hover:border-white hover:bg-emerald-900/30 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-emerald-700/50 flex items-center justify-center text-emerald-100/70 hover:text-white hover:border-white hover:bg-emerald-900/30 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-emerald-700/50 flex items-center justify-center text-emerald-100/70 hover:text-white hover:border-white hover:bg-emerald-900/30 transition-all duration-300"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.003 3.003 0 0 0-2.11 2.108C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.863.51 9.388.51 9.388.51s7.524 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.865.502-5.837.502-5.837s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-emerald-700/50 flex items-center justify-center text-emerald-100/70 hover:text-white hover:border-white hover:bg-emerald-900/30 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2.5 flex flex-col items-start gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80 mb-1">
              Product
            </span>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Dynamic Timeline
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Budget Ledger
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Itinerary Cloner
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Collaborative Polls
            </Link>
          </div>

          <div className="col-span-1 md:col-span-2.5 flex flex-col items-start gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80 mb-1">
              Company
            </span>
            <a href="#about" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              About Us
            </a>
            <a href="#about" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Our Story
            </a>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Careers
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col items-start gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80 mb-1">
              Resources
            </span>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Backpacker Blogs
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Help Center
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              Planning Guides
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-emerald-100/70 hover:text-white transition-colors">
              API Access
            </Link>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-emerald-800/30 text-left relative z-20">
          <span className="text-[10px] sm:text-xs text-emerald-100/40 font-light">
            © {new Date().getFullYear()} Wend.com. Built with absolute precision. All rights reserved.
          </span>

          <div className="flex items-center gap-5 text-[10px] sm:text-xs">
            <Link to="/" className="text-emerald-100/40 hover:text-white transition-colors font-light">
              Privacy Policy
            </Link>
            <Link to="/" className="text-emerald-100/40 hover:text-white transition-colors font-light">
              Terms of Service
            </Link>
            <button className="text-emerald-100/40 hover:text-white transition-colors font-light cursor-pointer focus:outline-none">
              Cookie Preferences
            </button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none z-10 select-none opacity-[0.06] flex items-end justify-center">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-auto min-w-[1000px] fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 500 120 L 500 70 L 503 70 L 503 40 L 500 40 L 500 35 Q 502 30 500 25 L 500 120 Z" />
          <path d="M 700 120 L 700 70 L 697 70 L 697 40 L 700 40 L 700 35 Q 698 30 700 25 L 700 120 Z" />
          <path d="M 525 120 L 525 75 Q 525 50 550 50 C 555 50 560 55 565 55 Q 600 55 600 25 C 600 22 597 18 600 15 C 603 18 600 22 600 25 Q 600 55 635 55 C 640 55 645 50 650 50 Q 675 50 675 75 L 675 120 Z" />
          <path d="M 565 120 L 565 80 L 575 80 L 575 60 Q 600 45 600 35 L 600 120 Z" />
          <path d="M 635 120 L 635 80 L 625 80 L 625 60 Q 600 45 600 35 L 600 120 Z" />
          
          <path d="M 410 120 L 420 40 L 425 40 L 425 35 L 420 35 L 422 20 L 425 20 L 425 15 L 420 15 L 421 5 L 424 5 L 424 0 L 416 0 L 416 5 L 419 5 L 418 15 L 413 15 L 413 20 L 417 20 L 415 35 L 410 35 L 410 40 L 415 40 L 405 120 Z" />
          
          <path d="M 150 120 L 150 50 Q 155 45 160 50 L 160 120 Z" />
          <path d="M 165 120 L 165 40 Q 175 30 185 40 L 185 120 Z" />
          <path d="M 190 120 L 190 50 Q 195 45 200 50 L 200 120 Z" />
          <path d="M 205 120 L 205 30 Q 220 15 235 30 L 235 120 Z" />
          <path d="M 240 120 L 240 50 Q 245 45 250 50 L 250 120 Z" />
          <path d="M 255 120 L 255 40 Q 265 30 275 40 L 275 120 Z" />
          <path d="M 280 120 L 280 50 Q 285 45 290 50 L 290 120 Z" />
          
          <path d="M 850 120 L 850 60 L 845 60 L 845 20 Q 848 10 852 10 Q 856 10 859 20 L 859 60 L 855 60 L 855 120 Z" />
          <path d="M 970 120 L 970 60 L 965 60 L 965 20 Q 968 10 972 10 Q 976 10 979 20 L 979 60 L 975 60 L 975 120 Z" />
          <path d="M 859 120 L 859 70 L 965 70 L 965 120 Z" />
          <path d="M 885 120 L 885 85 Q 912 60 939 85 L 939 120 Z" />
          <path d="M 859 55 L 965 55 L 965 65 L 859 65 Z" />
          
          <path d="M 50 120 L 50 80 Q 75 60 100 80 L 100 120 Z" />
          <path d="M 70 120 L 70 90 Q 75 85 80 90 L 80 120 Z" />

          <path d="M 1040 120 L 1040 45 L 1045 45 L 1045 40 L 1095 40 L 1095 45 L 1100 45 L 1100 120 Z" />
          <path d="M 1055 120 L 1055 80 Q 1070 60 1085 80 L 1085 120 Z" />
          <path d="M 1045 52 L 1095 52 L 1095 56 L 1045 56 Z" />
        </svg>
      </div>

    </footer>
  );
}
