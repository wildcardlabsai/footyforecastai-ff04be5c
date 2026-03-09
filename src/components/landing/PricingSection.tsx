import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
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
    monthly: 19,
    annual: 15,
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
    monthly: 49,
    annual: 39,
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
  const [annual, setAnnual] = useState(false);

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

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">-20%</Badge>
            </button>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-xl border p-8 transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-primary/40 bg-card glow-green"
                    : "border-border bg-card/50 hover:border-border/80 hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    <span className="relative z-10">MOST POPULAR</span>
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        backgroundImage: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.2) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">${price}</span>
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
                <Link to="/signup">
                  <Button
                    className={`mt-8 w-full font-semibold ${plan.highlighted ? "glow-green-sm" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.highlighted && <Zap className="mr-2 h-4 w-4" />}
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
