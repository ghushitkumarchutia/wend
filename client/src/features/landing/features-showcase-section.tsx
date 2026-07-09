import { Clock, Compass, Plane, Bed, Utensils, Copy, Star } from 'lucide-react';

export function FeaturesShowcaseSection() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 tracking-tight text-center max-w-3xl mx-auto mb-16 sm:mb-20 leading-[1.15]">
          Everything you need for <br /> perfect group journeys
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
          <div className="md:col-span-7 bg-[#fafaf9]/60 border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300 group">
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Make a Trip</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-xl">
                Design day-by-day itineraries with a beautiful interactive scrolling timeline.
                Connect flights, hotels, and custom spots into one unified view.
              </p>
            </div>

            <div className="w-full bg-[#f4f4f3] rounded-[24px] p-4 sm:p-5 border border-zinc-200/40 relative overflow-hidden h-[240px] flex flex-col justify-start select-none">
              <div className="bg-[#0b6646] text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-3.5 shadow-sm">
                Day 1
              </div>

              <div className="flex flex-col gap-3 relative pl-1.5 border-l border-dashed border-zinc-300">
                <div className="bg-white rounded-xl border border-zinc-200/60 p-3 flex items-center justify-between shadow-xs ml-3 relative">
                  <div className="absolute left-[-19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-zinc-300 border-2 border-[#f4f4f3]" />
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-50 p-2 rounded-lg text-zinc-500 shrink-0">
                      <Plane className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-zinc-900 leading-none">
                        Flight to Haneda
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-none">
                        NH 848 • Departs 08:30 AM
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50">
                    Confirmed
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200/60 p-3 flex items-center justify-between shadow-xs ml-3 relative opacity-85">
                  <div className="absolute left-[-19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-zinc-300 border-2 border-[#f4f4f3]" />
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-50 p-2 rounded-lg text-zinc-500 shrink-0">
                      <Bed className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-zinc-900 leading-none">
                        Kyoto Heritage Ryokan
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-none">
                        Traditional Suite • Check-in 03:00 PM
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#fafaf9]/60 border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300 group">
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Group Collab</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                Work live with your friends. Add members with read/write access and plan together
                with instantaneous sync.
              </p>
            </div>

            <div className="w-full bg-[#f4f4f3] rounded-[24px] p-4 sm:p-5 border border-zinc-200/40 relative overflow-hidden h-[240px] flex flex-col justify-between select-none">
              <div className="flex items-center justify-start border-b border-zinc-200/50 pb-2.5">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border border-[#f4f4f3] bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                    RD
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#f4f4f3] bg-amber-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                    AK
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#f4f4f3] bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                    MS
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium ml-2.5">3 online now</span>
              </div>

              <div className="flex flex-col gap-3.5 pt-2 flex-1 justify-end">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] text-zinc-400 font-semibold ml-1.5 mb-1">Rohan</span>
                  <div className="bg-white text-zinc-800 text-xs py-2 px-3.5 rounded-2xl rounded-tl-none border border-zinc-200/60 shadow-xs max-w-[85%] text-left">
                    Let's book the tea ceremony tour!
                  </div>
                </div>

                <div className="bg-[#0b6646] text-white text-xs py-2 px-3.5 rounded-2xl rounded-tr-none w-fit self-end max-w-[85%] shadow-xs text-left">
                  Added to Day 2 afternoon slot!
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#fafaf9]/60 border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300 group">
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Poll Request</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                Can't agree on lodging or hikes? Create elegant choice polls and let the majority
                vote decide the plan.
              </p>
            </div>

            <div className="w-full bg-[#f4f4f3] rounded-[24px] p-4 sm:p-5 border border-zinc-200/40 relative overflow-hidden h-[240px] flex flex-col justify-center gap-5 select-none">
              <div className="text-left">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Poll Options
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 mt-1">
                  Choose Villa accommodation:
                </h4>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-900 mb-1.5">
                    <span>A. Cliffside Infinity Villa</span>
                    <span className="text-[#0b6646]">75%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-200/70 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0b6646] rounded-full w-[75%]" />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400 mb-1.5">
                    <span>B. Jungle Treehouse Eco-lodge</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-200/70 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-300/80 rounded-full w-[25%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-[#fafaf9]/60 border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300 group">
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">
                Budget & Split Tracking
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-xl">
                Log expenses in any currency and split them with customizable ratios. View exact
                balances showing who owes who.
              </p>
            </div>

            <div className="w-full bg-[#f4f4f3] rounded-[24px] p-4 sm:p-5 border border-zinc-200/40 relative overflow-hidden h-[240px] flex flex-col justify-between select-none">
              <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2.5">
                <span className="text-xs sm:text-sm font-bold text-zinc-900">Trip Ledger</span>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                  Total: ₹84,500
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="bg-white rounded-xl border border-zinc-200/60 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-800 font-bold">
                    <Utensils className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>Sushi Dinner (Kyoto)</span>
                  </div>
                  <span className="text-zinc-500 font-bold text-right">₹12,400 by Rohan</span>
                </div>

                <div className="bg-[#eef5f2] rounded-xl border border-emerald-100/50 p-2.5 sm:p-3 flex items-center justify-between text-xs">
                  <span className="text-[#0b6646] font-bold">Rohan owes you ₹5,800</span>
                  <div className="bg-[#0b6646] text-white text-[9px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm">
                    SETTLE UP
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 bg-[#fafaf9]/60 border border-zinc-200/50 rounded-[32px] p-6 sm:p-10 flex flex-col hover:shadow-lg hover:shadow-zinc-100/50 transition-all duration-300 group">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
              <div className="md:col-span-6 text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  Clone Itinerary
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                  Don't start from scratch. Browse world-class itineraries created by seasoned
                  backpackers and explorers, and clone them into your group workspace with a single
                  click.
                </p>
              </div>

              <div className="md:col-span-6 flex justify-center w-full select-none">
                <div className="bg-white rounded-[24px] border border-zinc-200/80 p-5 shadow-md flex flex-col gap-4 relative overflow-hidden max-w-sm w-full">
                  <div className="absolute top-4 right-4 bg-[#0b6646] text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Star className="h-3 w-3 fill-white stroke-none" />
                    <span>4.9</span>
                  </div>

                  <div className="text-left pr-12">
                    <h4 className="font-bold text-sm sm:text-base text-zinc-950 tracking-tight leading-snug">
                      Spiti Valley Highlands Explorer
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-400 font-normal mt-1">
                      Kaza • Tabo • Dhankar Lake
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-50 border border-zinc-200/60 rounded-full px-3 py-1.5 text-[9px] sm:text-[10px] text-zinc-500 font-semibold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>9 Days</span>
                    </span>
                    <span className="bg-zinc-50 border border-zinc-200/60 rounded-full px-3 py-1.5 text-[9px] sm:text-[10px] text-zinc-500 font-semibold flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>Expert Guided</span>
                    </span>
                  </div>

                  <div className="bg-[#0b6646] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                    <Copy className="h-3.5 w-3.5" />
                    <span>Clone Itinerary Template</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
