import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "GoalPulse caught 3 late goals in one evening that I would have completely missed. The Telegram alerts are instant and the explanations actually make sense.",
    name: "Marcus R.",
    role: "Football Analyst, London",
    stars: 5,
  },
  {
    quote: "I've tried every prediction tool out there. GoalPulse is different — it doesn't try to predict everything, just the high-pressure moments. That focus is why it works.",
    name: "Sofia L.",
    role: "Sports Data Enthusiast, Barcelona",
    stars: 5,
  },
  {
    quote: "The strategy builder is genius. I set up a 'second half equalizer' filter and my hit rate jumped to 78%. No other platform gives you this level of control.",
    name: "James K.",
    role: "Pro Bettor, Melbourne",
    stars: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Football Intelligence Enthusiasts
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card/50 p-6 transition-all hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Star rating */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < t.stars ? "fill-warning text-warning" : "text-border"}`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
