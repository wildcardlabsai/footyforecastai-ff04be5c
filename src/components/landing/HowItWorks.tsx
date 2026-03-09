import { motion } from "framer-motion";
import { Radio, Brain, Bell, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Radio,
    title: "Real-Time Match Scanning",
    description: "GoalPulse continuously monitors hundreds of live matches, tracking shots, dangerous attacks, corners, possession shifts, and momentum changes every 60 seconds.",
    accent: "primary",
  },
  {
    icon: Brain,
    title: "Prediction Engine",
    description: "Our rule-based scoring engine analyzes 12+ statistical factors per match to calculate a real-time goal probability score from 0–100. No guesswork — just data.",
    accent: "accent",
  },
  {
    icon: Bell,
    title: "Telegram + Email Alerts",
    description: "When a match crosses your probability threshold and shows multiple active signals, you get an instant alert on Telegram and Email with full context.",
    accent: "primary",
  },
  {
    icon: BarChart3,
    title: "Track & Optimize",
    description: "Review your alert history, track hit rates by league and confidence level, and fine-tune your strategies to maximize accuracy over time.",
    accent: "accent",
  },
];

const HowItWorks = () => {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How <span className="text-primary">GoalPulse</span> Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From raw match data to actionable alerts in seconds. Four steps, zero noise.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.accent === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">STEP {i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
