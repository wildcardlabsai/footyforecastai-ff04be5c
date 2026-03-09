import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore GoalPulse with limited access",
    features: [
      "5 live match monitors",
      "3 alerts per day",
      "Email alerts only",
      "2 leagues",
      "Basic analytics",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious football watchers",
    features: [
      "Unlimited live monitors",
      "Unlimited alerts",
      "Telegram + Email alerts",
      "All leagues",
      "Custom strategies (up to 5)",
      "Full analytics dashboard",
      "Priority signal detection",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$49",
    period: "/month",
    description: "Maximum edge. Full control.",
    features: [
      "Everything in Pro",
      "Unlimited strategies",
      "API access",
      "Advanced tuning controls",
      "Webhook alerts",
      "Priority support",
      "Early access to new signals",
    ],
    cta: "Go Elite",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free. Upgrade when you need more signals, more leagues, and custom strategies.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-primary/40 bg-card glow-green"
                  : "border-border bg-card/50 hover:border-border/80"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  MOST POPULAR
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full font-semibold ${plan.highlighted ? "glow-green-sm" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.highlighted && <Zap className="mr-2 h-4 w-4" />}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
