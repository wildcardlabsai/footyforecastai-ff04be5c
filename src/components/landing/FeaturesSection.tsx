import { motion, useInView } from "framer-motion";
import { Shield, Sliders, Globe, Gauge, Clock, Layers } from "lucide-react";
import { useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/useCountUp";

const ProbabilityBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const score = useCountUp(82);

  return (
    <div ref={ref} className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Goal probability</span>
        <span className="font-mono font-bold text-primary" ref={score.ref}>{score.count}%</span>
      </div>
      <Progress
        value={isInView ? 82 : 0}
        className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent [&>div]:transition-all [&>div]:duration-[2s]"
      />
      <div className="flex gap-1">
        {["Shots ↑", "xG spike", "Momentum"].map((s) => (
          <span key={s} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

const StrategyPreview = () => (
  <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-3 text-xs space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">2nd Half Equalizer</span>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">Active</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
      <div>Min: 55'</div>
      <div>Prob: ≥70%</div>
      <div>Signals: ≥3</div>
    </div>
  </div>
);

const features = [
  {
    icon: Gauge,
    title: "12-Factor Scoring Engine",
    description: "Combines shots, xG, dangerous attacks, momentum, game state, red cards, and more into a single probability score updated every 60 seconds.",
    size: "large" as const,
    extra: "probability",
  },
  {
    icon: Sliders,
    title: "Custom Alert Strategies",
    description: "Build your own rules: set minute ranges, minimum signals, probability thresholds, league filters, and cooldown windows.",
    size: "large" as const,
    extra: "strategy",
  },
  {
    icon: Clock,
    title: "Goal Window Predictions",
    description: "Know not just IF but WHEN. Estimates whether a goal is likely in the next 5, 10, or 15 minutes.",
    size: "small" as const,
  },
  {
    icon: Globe,
    title: "40+ Leagues Supported",
    description: "From the Premier League to the Brazilian Série A. Global coverage, same analytical depth.",
    size: "small" as const,
  },
  {
    icon: Layers,
    title: "Signal Stacking",
    description: "Alerts only fire when multiple signals align — no single-factor false positives.",
    size: "small" as const,
  },
  {
    icon: Shield,
    title: "Confidence Bands",
    description: "Every alert comes with Low, Medium, High, or Very High confidence. Filter your feed.",
    size: "small" as const,
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

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const isLarge = f.size === "large";
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 ${
                  isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                }`}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className={`font-semibold text-foreground ${isLarge ? "text-lg" : "text-sm"}`}>{f.title}</h3>
                <p className={`mt-2 leading-relaxed text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>{f.description}</p>
                {f.extra === "probability" && <ProbabilityBar />}
                {f.extra === "strategy" && <StrategyPreview />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
