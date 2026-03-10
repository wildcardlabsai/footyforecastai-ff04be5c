import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoDailyPicks } from "@/services/demoPredictions";
import { Badge } from "@/components/ui/badge";
import { Target, BarChart3, TrendingUp, Zap } from "lucide-react";
import { MatchPrediction } from "@/services/footballPredictionEngine";

const PickCard = ({ p }: { p: MatchPrediction }) => (
  <div className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] text-muted-foreground">{p.league}</span>
      <Badge className={`text-[10px] ${
        p.confidenceLevel === 'high' ? 'bg-primary/20 text-primary border-primary/30' :
        p.confidenceLevel === 'medium' ? 'bg-warning/20 text-warning border-warning/30' :
        'bg-secondary text-muted-foreground border-border'
      }`}>{p.confidence}%</Badge>
    </div>
    <div className="text-sm font-semibold text-foreground">{p.homeTeam} vs {p.awayTeam}</div>
    <div className="mt-2 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">Prediction</span>
      <span className="font-medium text-foreground">{p.predictedResult} ({p.predictedScore})</span>
    </div>
    <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">{p.reasoning}</p>
  </div>
);

const DailyPicks = () => {
  const picks = useMemo(() => getDemoDailyPicks(), []);

  const sections = [
    { title: "Best Result Picks", icon: Target, data: picks.resultPicks },
    { title: "Best Goals Picks", icon: BarChart3, data: picks.goalsPicks },
    { title: "BTTS Picks", icon: TrendingUp, data: picks.bttsPicks },
    { title: "Value Picks", icon: Zap, data: picks.valuePicks },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Picks</h1>
          <p className="text-xs text-muted-foreground mt-1">Curated predictions for today · Updated daily</p>
        </div>

        {sections.map(section => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {section.data.length > 0 ? section.data.map(p => (
                <PickCard key={p.id} p={p} />
              )) : (
                <div className="col-span-full text-sm text-muted-foreground p-4 text-center">No picks available for this category today.</div>
              )}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DailyPicks;
