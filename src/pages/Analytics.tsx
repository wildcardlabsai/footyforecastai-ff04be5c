import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Bell, BarChart3, Clock, Sliders } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Tooltip as RechartsTooltip } from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_TICK } from "@/lib/chartTheme";

const Analytics = () => {
  // Demo analytics data
  const dailyAlerts = useMemo(() => [
    { day: 'Mon', alerts: 8, goals: 6 },
    { day: 'Tue', alerts: 12, goals: 9 },
    { day: 'Wed', alerts: 6, goals: 4 },
    { day: 'Thu', alerts: 15, goals: 11 },
    { day: 'Fri', alerts: 10, goals: 8 },
    { day: 'Sat', alerts: 22, goals: 16 },
    { day: 'Sun', alerts: 18, goals: 14 },
  ], []);

  const leagueBreakdown = useMemo(() => [
    { league: 'Premier League', alerts: 28, hitRate: 78 },
    { league: 'La Liga', alerts: 18, hitRate: 72 },
    { league: 'Bundesliga', alerts: 14, hitRate: 71 },
    { league: 'Serie A', alerts: 12, hitRate: 75 },
    { league: 'Ligue 1', alerts: 9, hitRate: 67 },
    { league: 'Champions League', alerts: 7, hitRate: 86 },
    { league: 'Eredivisie', alerts: 5, hitRate: 60 },
    { league: 'Other', alerts: 8, hitRate: 63 },
  ], []);

  const confidenceData = useMemo(() => [
    { name: 'Very High', value: 22, color: CHART_COLORS.primary },
    { name: 'High', value: 38, color: CHART_COLORS.accent },
    { name: 'Medium', value: 31, color: CHART_COLORS.warning },
    { name: 'Low', value: 9, color: CHART_COLORS.muted },
  ], []);

  const hourlyData = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    alerts: i >= 12 && i <= 22 ? Math.round(Math.random() * 8 + 2) : Math.round(Math.random() * 3),
  })), []);

  const resultPie = useMemo(() => [
    { name: 'Goal Scored', value: 68, color: CHART_COLORS.primary },
    { name: 'No Goal', value: 25, color: CHART_COLORS.destructive },
    { name: 'Pending', value: 7, color: CHART_COLORS.warning },
  ], []);

  const summaryStats = [
    { icon: Bell, label: "Total Alerts (7d)", value: "91", color: "text-foreground" },
    { icon: Target, label: "Hit Rate", value: "73%", color: "text-primary" },
    { icon: TrendingUp, label: "Avg Probability", value: "68%", color: "text-accent" },
    { icon: Clock, label: "Avg Response", value: "4.2s", color: "text-foreground" },
    { icon: Sliders, label: "Active Strategies", value: "2", color: "text-primary" },
    { icon: BarChart3, label: "Leagues Covered", value: "8", color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">Last 7 days · Demo data</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summaryStats.map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Daily alerts chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Alerts vs Goals (7 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyAlerts}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="day" tick={{ ...CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ ...CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="alerts" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} opacity={0.6} name="Alerts" />
                <Bar dataKey="goals" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Goals Hit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hit rate by league */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Hit Rate by League</h3>
            <div className="space-y-2.5">
              {leagueBreakdown.map(l => (
                <div key={l.league} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-32 truncate">{l.league}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${l.hitRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-primary w-10 text-right">{l.hitRate}%</span>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{l.alerts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Confidence breakdown */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Confidence Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {confidenceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'hsl(220, 18%, 7%)', border: '1px solid hsl(220, 14%, 16%)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {confidenceData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Result breakdown */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Alert Results</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={resultPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {resultPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'hsl(220, 18%, 7%)', border: '1px solid hsl(220, 14%, 16%)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {resultPie.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly distribution */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Hourly Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: 'hsl(220, 18%, 7%)', border: '1px solid hsl(220, 14%, 16%)', borderRadius: 8, fontSize: 12 }} />
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(151, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(151, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="alerts" stroke="hsl(151, 100%, 50%)" fill="url(#alertGrad)" strokeWidth={2} name="Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
