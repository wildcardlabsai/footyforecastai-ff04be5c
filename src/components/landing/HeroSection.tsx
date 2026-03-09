import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Zap, Target, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountUp } from "@/hooks/useCountUp";
import DashboardPreview from "./DashboardPreview";

const floatingBadges = [
  {
    text: "⚡ Arsenal 82% — Goal likely",
    position: "top-8 -left-4 lg:top-16 lg:-left-12",
    delay: 0,
    animation: "animate-float",
  },
  {
    text: "🔥 3 signals active",
    position: "top-1/3 -right-2 lg:-right-8",
    delay: 1.5,
    animation: "animate-float-slow",
  },
  {
    text: "🎯 xG spike detected",
    position: "bottom-12 -left-2 lg:bottom-16 lg:-left-6",
    delay: 3,
    animation: "animate-float-slower",
  },
];

const HeroSection = () => {
  const accuracy = useCountUp(73);
  const alerts = useCountUp(2400);
  const matches = useCountUp(180);

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pt-20 pb-16 text-center lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Radio className="h-3 w-3 animate-pulse-glow" />
            Live Football Intelligence Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Spot Goal Pressure{" "}
            <span className="text-primary text-glow-green">Before The Net Bulges</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            GoalPulse scans live football matches and alerts you when a goal looks
            likely within the next 15 minutes. Powered by real-time stats and
            intelligent signal detection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/signup">
              <Button size="lg" className="glow-green gap-2 px-8 text-base font-bold">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border px-8 text-base"
              >
                <Play className="h-4 w-4" /> View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm sm:gap-16 sm:px-12"
          >
            <div className="text-center" ref={accuracy.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary sm:text-3xl">
                <TrendingUp className="h-5 w-5" /> {accuracy.count}%
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Prediction Accuracy
              </div>
            </div>
            <div className="text-center" ref={alerts.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent sm:text-3xl">
                <Zap className="h-5 w-5" /> {alerts.count >= 1000 ? `${(alerts.count / 1000).toFixed(1)}k` : alerts.count}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Alerts This Month
              </div>
            </div>
            <div className="text-center" ref={matches.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground sm:text-3xl">
                <Target className="h-5 w-5" /> {matches.count}+
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Matches Scanned Daily
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview with floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mt-16 w-full hidden md:block"
          >
            {/* Floating signal badges */}
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + badge.delay * 0.3 }}
                className={`absolute z-10 ${badge.position} ${badge.animation}`}
                style={{ animationDelay: `${badge.delay}s` }}
              >
                <div className="rounded-lg border border-primary/20 bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg shadow-primary/5 backdrop-blur-sm">
                  {badge.text}
                </div>
              </motion.div>
            ))}
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
