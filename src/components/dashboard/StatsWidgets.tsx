import { Radio, TrendingUp, Bell, Target } from "lucide-react";

interface StatsData {
  liveMatches: number;
  hotMatches: number;
  alertsToday: number;
  predictionAccuracy: number;
}

const StatsWidgets = ({ stats }: { stats: StatsData }) => {
  const widgets = [
    { icon: Radio, label: "Live Matches", value: stats.liveMatches, color: "text-foreground", iconColor: "text-accent" },
    { icon: TrendingUp, label: "Hot Matches", value: stats.hotMatches, color: "text-primary", iconColor: "text-primary" },
    { icon: Bell, label: "Alerts Today", value: stats.alertsToday, color: "text-accent", iconColor: "text-accent" },
    { icon: Target, label: "Hit Rate", value: `${stats.predictionAccuracy}%`, color: "text-primary", iconColor: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {widgets.map((w) => (
        <div key={w.label} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <w.icon className={`h-4 w-4 ${w.iconColor}`} />
            </div>
            <span className="text-xs text-muted-foreground">{w.label}</span>
          </div>
          <div className={`mt-3 text-2xl font-bold font-mono ${w.color}`}>{w.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsWidgets;
