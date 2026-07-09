export function StatsHighlightsSection() {
  return (
    <section className="bg-white py-12 sm:py-16 border-t border-b border-zinc-100 select-none">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 justify-items-center">
          
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0b6646] tracking-tight mb-2 sm:mb-3">
              50+
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 max-w-[200px] leading-relaxed">
              Verified Cozy Destinations
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0b6646] tracking-tight mb-2 sm:mb-3">
              200+
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 max-w-[200px] leading-relaxed">
              Group Trips Planned
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0b6646] tracking-tight mb-2 sm:mb-3">
              120,000+
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 max-w-[200px] leading-relaxed">
              Active Co-Planners
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0b6646] tracking-tight mb-2 sm:mb-3">
              $15 Million
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 max-w-[200px] leading-relaxed">
              Expenses Netted & Split
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
