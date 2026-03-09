import { motion } from "framer-motion";
import { Radio, Brain, Bell, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Radio,
    title: "Real-Time Match Scanning",
    description: "GoalPulse continuously monitors hundreds of live matches, tracking shots, dangerous attacks, corners, possession shifts, and momentum changes every 60 seconds.",
    accent: "primary" as const,
  },
  {
    icon: Brain,
    title: "Prediction Engine",
    description: "Our rule-based scoring engine analyzes 12+ statistical factors per match to calculate a real-time goal probability score from 0–100.",
    accent: "accent" as const,
  },
  {
    icon: Bell,
    title: "Telegram + Email Alerts",
    description: "When a match crosses your probability threshold and shows multiple active signals, you get an instant alert with full context.",
    accent: "primary" as const,
  },
  {
    icon: BarChart3,
    title: "Track & Optimize",
    description: "Review your alert history, track hit rates by league and confidence level, and fine-tune your strategies to maximize accuracy.",
    accent: "accent" as const,
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

        {/* Desktop: horizontal timeline */}
        <div className="mt-20 hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-[52px] left-[60px] right-[60px] h-px bg-border" />
            {/* Animated pulse along line */}
            <div className="absolute top-[51px] left-[60px] right-[60px] h-[3px] overflow-hidden">
              <div className="absolute h-full w-8 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse-line" />
            </div>

            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step number with gradient ring */}
                  <div className={`relative z-10 flex h-[104px] w-[104px] items-center justify-center`}>
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.accent === "primary" ? "from-primary/30 to-primary/5" : "from-accent/30 to-accent/5"} p-[2px]`}>
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${step.accent === "primary" ? "bg-primary/10" : "bg-accent/10"}`}>
                          <step.icon className={`h-7 w-7 ${step.accent === "primary" ? "text-primary" : "text-accent"}`} />
                        </div>
                      </div>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-[10px] font-mono font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: zigzag vertical timeline */}
        <div className="mt-16 lg:hidden">
          <div className="relative space-y-8">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4 pl-14"
              >
                <div className={`absolute left-2 flex h-9 w-9 items-center justify-center rounded-full border-2 ${step.accent === "primary" ? "border-primary/30 bg-primary/10" : "border-accent/30 bg-accent/10"}`}>
                  <step.icon className={`h-4 w-4 ${step.accent === "primary" ? "text-primary" : "text-accent"}`} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">STEP {i + 1}</span>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
