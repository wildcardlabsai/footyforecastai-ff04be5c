import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";

const UpsetWatch = () => {
  const { data: predictions = [], isLoading, error } = usePredictionsData();

  const upsets = useMemo(() =>
    predictions.filter(p => p.isUpset || (p.confidence < 55 && p.homeWinProb < 40 && p.awayWinProb > 35)),
    [predictions]
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Upset Watch</h1>
          <p className="text-xs text-muted-foreground mt-1">Potential surprise results backed by strong data indicators</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load data. Please try again later.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Match</th>
                    <th className="px-4 py-3 text-center font-medium">Underdog</th>
                    <th className="px-4 py-3 text-center font-medium">Upset Conf.</th>
                    <th className="px-4 py-3 text-center font-medium">Risk Level</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {upsets.map(p => {
                    const underdog = p.homeWinProb < p.awayWinProb ? p.homeTeam : p.awayTeam;
                    const risk = p.confidence < 50 ? 'High' : p.confidence < 65 ? 'Medium' : 'Low';
                    return (
                      <tr key={p.id} className="border-b border-border/20 transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3">
                          <div className="text-[10px] text-muted-foreground">{p.league}</div>
                          <div className="font-medium text-foreground">{p.homeTeam} vs {p.awayTeam}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-warning">{underdog}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono font-bold text-warning">{p.upsetConfidence || p.confidence}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-[10px] ${
                            risk === 'High' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                            risk === 'Medium' ? 'bg-warning/20 text-warning border-warning/30' :
                            'bg-primary/20 text-primary border-primary/30'
                          }`}>{risk}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell max-w-xs truncate">{p.reasoning}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {upsets.length === 0 && (
              <div className="p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upset predictions identified today.</p>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Upset predictions carry higher risk. For informational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default UpsetWatch;
