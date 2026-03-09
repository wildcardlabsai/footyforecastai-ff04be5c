import { motion } from "framer-motion";
import { Shield, Sliders, Globe, Gauge, Clock, Layers } from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "12-Factor Scoring Engine",
    description: "Combines shots, xG, dangerous attacks, momentum, game state, red cards, and more into a single probability score updated every 60 seconds.",
  },
  {
    icon: Sliders,
    title: "Custom Alert Strategies",
    description: "Build your own rules: set minute ranges, minimum signals, probability thresholds, league filters, and cooldown windows. Save, duplicate, and activate with one click.",
  },
  {
    icon: Clock,
    title: "Goal Window Predictions",
    description: "Know not just IF but WHEN. GoalPulse estimates whether a goal is likely in the next 5, 10, or 15 minutes based on signal intensity.",
  },
  {
    icon: Globe,
    title: "40+ Leagues Supported",
    description: "From the Premier League to the Brazilian Série A. Monitor top-tier and emerging leagues worldwide with the same analytical depth.",
  },
  {
    icon: Layers,
    title: "Signal Stacking",
    description: "Alerts only fire when multiple signals align — shots on target spike, momentum shift, dangerous attacks surge. No single-factor false positives.",
  },
  {
    icon: Shield,
    title: "Confidence Bands",
    description: "Every alert comes with a confidence level: Low, Medium, High, or Very High. Filter your feed to only see alerts you trust.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 bg-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for <span className="text-accent text-glow-cyan">Serious</span> Football Intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every feature is designed to reduce noise and surface the moments that matter.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
