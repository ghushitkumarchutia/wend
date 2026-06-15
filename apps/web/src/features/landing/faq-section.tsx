import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is Wend free to use?',
    answer:
      'Yes, Wend is completely free for all users. Create unlimited trips, invite as many members as you need, and use all features at no cost.',
  },
  {
    question: 'How many people can join a trip?',
    answer:
      'There is no hard limit on the number of members per trip. Wend is designed for groups of any size, from a couple to large tour groups.',
  },
  {
    question: 'Can I use Wend for solo trips?',
    answer:
      'Absolutely. While Wend is built for group collaboration, it works great as a personal trip planner too. You get the same itinerary builder, expense tracker, and document storage.',
  },
  {
    question: 'How does expense splitting work?',
    answer:
      'When someone logs an expense, they choose how to split it: equally among all members, by custom amounts, by percentage, or by exact shares. Wend automatically calculates who owes whom and suggests the minimum number of settlements to square up.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All data is encrypted in transit, passwords are hashed with a memory-hard algorithm, and files are stored in private object storage with presigned access. Session cookies are HttpOnly and cannot be read by JavaScript.',
  },
  {
    question: 'Can I export my trip data?',
    answer:
      'Data export is planned for a future release. For now, all your trip information — itinerary, expenses, documents, and chat history — is always accessible within the app.',
  },
];

export function FaqSection() {
  return (
    <section className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-muted-foreground">
          Quick answers to the most common questions.
        </p>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
