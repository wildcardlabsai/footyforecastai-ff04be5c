import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_TICK } from "@/lib/chartTheme";

const Analytics = () => {
  const { data: predictions = [], isLoading } = usePredictionsData();

  const leagueBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; highConf: number }>();
    predictions.forEach(p => {
      const entry = map.get(p.league) || { count: 0, highConf: 0 };
      entry.count++;
      if (p.confidence >= 60) entry.highConf++;
      map.set(p.league, entry);
    });
    return Array.from(map.entries())
      .map(([league, { count, highConf }]) => ({ league, count, highConfRate: count > 0 ? Math.round((highConf / count) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [predictions]);

  const confidenceData = useMemo(() => {
    const high = predictions.filter(p => p.confidence >= 80).length;
    const medium = predictions.filter(p => p.confidence >= 60 && p.confidence < 80).length;
    const low = predictions.filter(p => p.confidence < 60).length;
    return [
      { name: 'High (80%+)', value: high, color: CHART_COLORS.primary },
      { name: 'Medium (60-79%)', value: medium, color: CHART_COLORS.warning },
      { name: 'Low (<60%)', value: low, color: CHART_COLORS.muted },
    ].filter(d => d.value > 0);
  }, [predictions]);

  const resultBreakdown = useMemo(() => {
    const homeWin = predictions.filter(p => p.predictedResult === 'Home Win').length;
    const draw = predictions.filter(p => p.predictedResult === 'Draw').length;
    const awayWin = predictions.filter(p => p.predictedResult === 'Away Win').length;
    return [
      { name: 'Home Win', value: homeWin, color: CHART_COLORS.primary },
      { name: 'Draw', value: draw, color: CHART_COLORS.warning },
      { name: 'Away Win', value: awayWin, color: CHART_COLORS.accent },
    ].filter(d => d.value > 0);
  }, [predictions]);

  const marketStats = useMemo(() => {
    const over25 = predictions.filter(p => p.over25Prob >= 60).length;
    const btts = predictions.filter(p => p.bttsProb >= 55).length;
    const upsets = predictions.filter(p => p.isUpset).length;
    return [
      { label: "Total Predictions", value: predictions.length, color: "text-foreground" },
      { label: "Over 2.5 Tips", value: over25, color: "text-primary" },
      { label: "BTTS Tips", value: btts, color: "text-accent" },
      { label: "Upsets Flagged", value: upsets, color: "text-warning" },
      { label: "Leagues Covered", value: leagueBreakdown.length, color: "text-primary" },
      { label: "High Conf.", value: predictions.filter(p => p.confidence >= 80).length, color: "text-accent" },
    ];
  }, [predictions, leagueBreakdown]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-xs text-muted-foreground mt-1">Based on current predictions data</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {marketStats.map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3">
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Predictions per league */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Predictions by League</h3>
                {leagueBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={leagueBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                      <XAxis type="number" tick={{ ...CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="league" type="category" tick={{ ...CHART_TICK, fontSize: 10 }} width={110} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Predictions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </div>

              {/* Confidence breakdown pie */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Confidence Distribution</h3>
                {confidenceData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                          {confidenceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {confidenceData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Result predictions breakdown */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Predicted Results</h3>
                {resultBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={resultBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                          {resultBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {resultBreakdown.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-[10px] text-muted-foreground">{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </div>

              {/* League high-confidence rates */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">High Confidence Rate by League</h3>
                <div className="space-y-2.5">
                  {leagueBreakdown.map(l => (
                    <div key={l.league} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32 truncate">{l.league}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${l.highConfRate}%` }} />
                      </div>
                      <span className="text-xs font-mono text-primary w-10 text-right">{l.highConfRate}%</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{l.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
