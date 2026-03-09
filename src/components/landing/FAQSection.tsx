import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does GoalPulse predict goals?",
    a: "GoalPulse uses a 12-factor rule-based scoring engine that analyzes real-time match statistics including shots, shots on target, dangerous attacks, corners, possession trends, xG, momentum shifts, and game state. Alerts only trigger when multiple signals align simultaneously.",
  },
  {
    q: "What is the prediction accuracy?",
    a: "Our overall hit rate across all confidence levels is approximately 73%. High and Very High confidence alerts perform significantly better, with hit rates above 80% in many leagues.",
  },
  {
    q: "Which leagues are supported?",
    a: "GoalPulse currently covers 40+ leagues worldwide, including the Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, MLS, Brasileiro Série A, and many more.",
  },
  {
    q: "How do Telegram alerts work?",
    a: "After connecting your Telegram account through our bot, you'll receive instant messages whenever a match in your watchlist crosses your configured probability threshold. Each alert includes the match details, probability score, active signals, and a brief explanation.",
  },
  {
    q: "Can I customize when I receive alerts?",
    a: "Absolutely. The Strategy Builder lets you configure minute ranges, minimum signal counts, probability thresholds, league filters, and cooldown windows. You can create multiple strategies and activate them independently.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free plan includes 5 live match monitors, 3 alerts per day, and access to 2 leagues. It's a great way to experience GoalPulse before upgrading.",
  },
  {
    q: "How often is match data updated?",
    a: "The prediction engine processes each live match every 60 seconds, recalculating probability scores and checking for active signals in real time.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border border-border bg-card/50 px-4 data-[state=open]:border-primary/20"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
