import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Zap, ArrowRight, ArrowLeft, Globe, Bell, Sliders, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const LEAGUES = [
  "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1",
  "Champions League", "Europa League", "Eredivisie", "Primeira Liga",
  "MLS", "Brasileiro Série A", "Argentine Primera", "Saudi Pro League",
  "Turkish Süper Lig", "Scottish Premiership", "Belgian Pro League",
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney", "Africa/Lagos",
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [alertChannel, setAlertChannel] = useState<string>("email");
  const [alertStyle, setAlertStyle] = useState<string>("balanced");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [watchlistLeagues, setWatchlistLeagues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleLeague = (league: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(league) ? list.filter((l) => l !== league) : [...list, league]);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error: prefError } = await supabase.from("user_preferences").insert({
        user_id: user.id,
        preferred_leagues: selectedLeagues,
        alert_channel: alertChannel as "telegram" | "email" | "both",
        alert_style: alertStyle as "conservative" | "balanced" | "aggressive",
        timezone,
        watchlist_leagues: watchlistLeagues,
      });
      if (prefError) throw prefError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true, timezone })
        .eq("user_id", user.id);
      if (profileError) throw profileError;

      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error saving preferences", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const steps = [
    {
      icon: Trophy,
      title: "Select Your Leagues",
      subtitle: "Choose the leagues you want GoalPulse to monitor",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {LEAGUES.map((league) => (
            <button
              key={league}
              onClick={() => toggleLeague(league, selectedLeagues, setSelectedLeagues)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                selectedLeagues.includes(league)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Bell,
      title: "Alert Channels",
      subtitle: "How do you want to receive goal pressure alerts?",
      content: (
        <RadioGroup value={alertChannel} onValueChange={setAlertChannel} className="space-y-3">
          {[
            { value: "email", label: "Email Only", desc: "Receive alerts in your inbox" },
            { value: "telegram", label: "Telegram Only", desc: "Instant alerts via Telegram bot" },
            { value: "both", label: "Both", desc: "Never miss an alert" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
                alertChannel === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
            >
              <RadioGroupItem value={opt.value} />
              <div>
                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      ),
    },
    {
      icon: Sliders,
      title: "Alert Style",
      subtitle: "How aggressively should we alert you?",
      content: (
        <RadioGroup value={alertStyle} onValueChange={setAlertStyle} className="space-y-3">
          {[
            { value: "conservative", label: "Conservative", desc: "Only very high confidence alerts (75+). Fewer alerts, higher accuracy." },
            { value: "balanced", label: "Balanced", desc: "High confidence and above (62+). Good mix of volume and accuracy." },
            { value: "aggressive", label: "Aggressive", desc: "Medium confidence and above (50+). More alerts, broader coverage." },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
                alertStyle === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
              }`}
            >
              <RadioGroupItem value={opt.value} />
              <div>
                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      ),
    },
    {
      icon: Globe,
      title: "Timezone & Watchlist",
      subtitle: "Set your timezone and pick watchlist leagues",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Your Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Watchlist Leagues (priority monitoring)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {selectedLeagues.length > 0 ? selectedLeagues.map((league) => (
                <label key={league} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:bg-secondary/20">
                  <Checkbox
                    checked={watchlistLeagues.includes(league)}
                    onCheckedChange={() => toggleLeague(league, watchlistLeagues, setWatchlistLeagues)}
                  />
                  {league}
                </label>
              )) : (
                <p className="col-span-2 text-sm text-muted-foreground">Go back and select leagues first</p>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-green-sm">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">GoalPulse<span className="text-primary"> AI</span></span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <currentStep.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
                <p className="text-xs text-muted-foreground">{currentStep.subtitle}</p>
              </div>
            </div>

            {currentStep.content}

            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button
                className="flex-1 glow-green-sm font-semibold"
                onClick={() => (step < steps.length - 1 ? setStep(step + 1) : handleComplete())}
                disabled={loading}
              >
                {step < steps.length - 1 ? "Continue" : loading ? "Saving..." : "Launch Dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
