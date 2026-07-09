import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is Wend.com?',
    answer: 'Wend.com is a collaborative trip planning platform designed to unify your group travel experience. It allows you to build day-by-day itineraries, vote on lodging and activities, track shared expenses, and chat in real-time—all in one place.',
  },
  {
    id: 'faq-2',
    question: 'How does group collaboration work?',
    answer: 'Simply create a trip, copy your unique invite link, and share it with your co-planners. Once they join, they can instantly edit the itinerary timeline, vote in polls, log expenses, and participate in the group chat with real-time updates.',
  },
  {
    id: 'faq-3',
    question: 'Can we track budgets in different currencies?',
    answer: 'Yes, absolutely! Wend supports entering expenses in multiple currencies. The built-in ledger handles real-time conversion rates to net out who owes who, making it simple to settle up at the end of the journey.',
  },
  {
    id: 'faq-4',
    question: 'Can I copy or clone an existing itinerary?',
    answer: "Yes! You can explore public, expert-designed templates and copy them into your active trip workspace. From there, you can customize the days, bookings, and activities to perfectly fit your group's plan.",
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-[#fafaf9]/30 py-16 md:py-24 border-b border-zinc-100 select-none">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16">
        <h2 className="text-3xl sm:text-[40px] font-bold text-zinc-950 text-center tracking-tight mb-12 sm:mb-16">
          Frequently Asked Questions
        </h2>

        <div className="max-w-[760px] mx-auto w-full flex flex-col gap-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-zinc-200/80 rounded-2xl transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-zinc-900 font-semibold text-sm sm:text-base hover:text-[#0b6646] transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#0b6646]' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-50/50">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
