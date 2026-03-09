import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

const matches = [
  { league: "Premier League", home: "Arsenal", away: "Chelsea", score: "1-1", minute: 67, prob: 82, signals: 4, status: "hot" },
  { league: "La Liga", home: "Real Madrid", away: "Atletico", score: "2-1", minute: 74, prob: 71, signals: 3, status: "hot" },
  { league: "Bundesliga", home: "Bayern", away: "Dortmund", score: "0-0", minute: 55, prob: 64, signals: 2, status: "watch" },
  { league: "Serie A", home: "Inter", away: "Napoli", score: "1-0", minute: 41, prob: 48, signals: 1, status: "normal" },
  { league: "Ligue 1", home: "PSG", away: "Lyon", score: "3-1", minute: 78, prob: 35, signals: 0, status: "normal" },
];

const getConfidenceBadge = (prob: number) => {
  if (prob >= 75) return <Badge className="bg-primary/20 text-primary border-primary/30 glow-green-sm text-xs">Very High</Badge>;
  if (prob >= 60) return <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">High</Badge>;
  if (prob >= 40) return <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">Medium</Badge>;
  return <Badge variant="outline" className="text-muted-foreground text-xs">Low</Badge>;
};

const DashboardPreview = () => {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-1 backdrop-blur-sm glow-green" style={{ boxShadow: '0 0 80px hsl(151 100% 50% / 0.08), 0 25px 50px -12px rgb(0 0 0 / 0.5)' }}>
      <div className="rounded-lg border border-border/50 bg-background">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">GoalPulse AI — Live Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-primary font-mono">LIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 border-b border-border/50 p-4">
          {[
            { label: "Live Matches", value: "24", color: "text-foreground" },
            { label: "Hot Matches", value: "5", color: "text-primary" },
            { label: "Alerts Today", value: "12", color: "text-accent" },
            { label: "Hit Rate", value: "73%", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 bg-secondary/30 p-3 text-center">
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_0.7fr_0.7fr_1fr_0.8fr] gap-2 border-b border-border/30 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>League</div>
            <div>Match</div>
            <div className="text-center">Score</div>
            <div className="text-center">Min</div>
            <div className="text-center">Goal Prob.</div>
            <div className="text-center">Status</div>
          </div>
          {matches.map((m, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_2fr_0.7fr_0.7fr_1fr_0.8fr] gap-2 items-center px-4 py-2.5 text-xs transition-colors hover:bg-secondary/20 ${m.status === "hot" ? "bg-primary/[0.03]" : ""} ${i < matches.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div className="text-muted-foreground truncate">{m.league}</div>
              <div className="font-medium text-foreground truncate">{m.home} vs {m.away}</div>
              <div className="text-center font-mono font-bold text-foreground">{m.score}</div>
              <div className="text-center font-mono text-muted-foreground">{m.minute}'</div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.prob >= 70 ? "bg-primary" : m.prob >= 50 ? "bg-accent" : "bg-muted-foreground"}`}
                    style={{ width: `${m.prob}%` }}
                  />
                </div>
                <span className={`font-mono font-bold ${m.prob >= 70 ? "text-primary" : m.prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>
                  {m.prob}%
                </span>
              </div>
              <div className="flex justify-center">
                {m.status === "hot" ? (
                  <div className="flex items-center gap-1 text-primary">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-[10px] font-semibold">HOT</span>
                  </div>
                ) : m.status === "watch" ? (
                  <div className="flex items-center gap-1 text-accent">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-[10px]">WATCH</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
