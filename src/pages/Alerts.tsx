import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoMatches, getDemoAlerts, DemoAlert } from "@/services/demoData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Check, X, Clock, Mail, MessageCircle, Filter, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getResultBadge = (result: string) => {
  switch (result) {
    case 'goal_scored': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] gap-1"><Check className="h-2.5 w-2.5" />Goal ✓</Badge>;
    case 'no_goal': return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px] gap-1"><X className="h-2.5 w-2.5" />No Goal</Badge>;
    default: return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px] gap-1"><Clock className="h-2.5 w-2.5" />Pending</Badge>;
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'telegram': return <MessageCircle className="h-3.5 w-3.5 text-accent" />;
    case 'email': return <Mail className="h-3.5 w-3.5 text-muted-foreground" />;
    default: return <div className="flex gap-1"><MessageCircle className="h-3.5 w-3.5 text-accent" /><Mail className="h-3.5 w-3.5 text-muted-foreground" /></div>;
  }
};

const getConfBadge = (conf: string) => {
  switch (conf) {
    case 'very_high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Very High</Badge>;
    case 'high': return <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

// Generate more demo alerts for history
function generateAlertHistory(): DemoAlert[] {
  const base = getDemoAlerts();
  const extras: DemoAlert[] = [
    { id: 'ah1', matchId: 'dm3', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', league: 'Bundesliga', minute: 62, probabilityScore: 67, confidence: 'high', channel: 'telegram', result: 'goal_scored', reason: 'Rising momentum and xG in a goalless match approaching key window.', createdAt: new Date(Date.now() - 45 * 60000) },
    { id: 'ah2', matchId: 'dm4', homeTeam: 'Inter Milan', awayTeam: 'Napoli', league: 'Serie A', minute: 38, probabilityScore: 52, confidence: 'medium', channel: 'email', result: 'no_goal', reason: 'Early dangerous attacks spike but low minute reduces confidence.', createdAt: new Date(Date.now() - 90 * 60000) },
    { id: 'ah3', matchId: 'dm5', homeTeam: 'PSG', awayTeam: 'Lyon', league: 'Ligue 1', minute: 80, probabilityScore: 85, confidence: 'very_high', channel: 'both', result: 'goal_scored', reason: 'Dominant late-game pressure with high SOT and xG spike.', createdAt: new Date(Date.now() - 120 * 60000) },
    { id: 'ah4', matchId: 'dm8', homeTeam: 'Ajax', awayTeam: 'PSV', league: 'Eredivisie', minute: 73, probabilityScore: 71, confidence: 'high', channel: 'telegram', result: 'goal_scored', reason: 'Red card advantage creating sustained attacking pressure.', createdAt: new Date(Date.now() - 150 * 60000) },
    { id: 'ah5', matchId: 'dm10', homeTeam: 'Villarreal', awayTeam: 'Real Sociedad', league: 'La Liga', minute: 56, probabilityScore: 58, confidence: 'medium', channel: 'email', result: 'no_goal', reason: 'Moderate signals in a tight second-half encounter.', createdAt: new Date(Date.now() - 200 * 60000) },
    { id: 'ah6', matchId: 'dm14', homeTeam: 'Porto', awayTeam: 'Sporting CP', league: 'Primeira Liga', minute: 65, probabilityScore: 74, confidence: 'high', channel: 'both', result: 'goal_scored', reason: 'Strong corner and shot pressure from Porto in the second half.', createdAt: new Date(Date.now() - 300 * 60000) },
    { id: 'ah7', matchId: 'dm17', homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', league: 'Turkish Süper Lig', minute: 72, probabilityScore: 69, confidence: 'high', channel: 'telegram', result: 'pending', reason: 'Derby intensity with elevated shots on target.', createdAt: new Date(Date.now() - 15 * 60000) },
  ];
  return [...base, ...extras].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

const Alerts = () => {
  const [resultFilter, setResultFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [confFilter, setConfFilter] = useState("all");

  const alerts = useMemo(() => generateAlertHistory(), []);
  const liveCount = getDemoMatches().filter(m => m.status === 'live').length;

  const filtered = alerts.filter(a => {
    if (resultFilter !== "all" && a.result !== resultFilter) return false;
    if (channelFilter !== "all" && a.channel !== channelFilter) return false;
    if (confFilter !== "all" && a.confidence !== confFilter) return false;
    return true;
  });

  const stats = useMemo(() => {
    const total = alerts.length;
    const goals = alerts.filter(a => a.result === 'goal_scored').length;
    const pending = alerts.filter(a => a.result === 'pending').length;
    const hitRate = total - pending > 0 ? Math.round((goals / (total - pending)) * 100) : 0;
    return { total, goals, pending, hitRate };
  }, [alerts]);

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alert History</h1>
          <p className="text-xs text-muted-foreground mt-1">{stats.total} alerts triggered today · {stats.hitRate}% hit rate</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Alerts", value: stats.total, color: "text-foreground" },
            { label: "Goals Hit", value: stats.goals, color: "text-primary" },
            { label: "Pending", value: stats.pending, color: "text-warning" },
            { label: "Hit Rate", value: `${stats.hitRate}%`, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3">
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
              <div className={`text-xl font-bold font-mono mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card border-border"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="goal_scored">Goal ✓</SelectItem>
              <SelectItem value="no_goal">No Goal</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs bg-card border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="very_high">Very High</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts list */}
        <div className="space-y-2">
          {filtered.map(alert => (
            <div key={alert.id} className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{alert.league}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(alert.createdAt, { addSuffix: true })}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.minute}'</span>
                  </div>
                  <div className="text-sm font-medium text-foreground mt-1">{alert.homeTeam} vs {alert.awayTeam}</div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{alert.reason}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getResultBadge(alert.result)}
                    {getConfBadge(alert.confidence)}
                    <div className="flex items-center gap-1">{getChannelIcon(alert.channel)}</div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className={`text-2xl font-bold font-mono ${alert.probabilityScore >= 75 ? "text-primary text-glow-green" : alert.probabilityScore >= 60 ? "text-accent" : "text-warning"}`}>
                    {alert.probabilityScore}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {alert.probabilityScore >= 80 ? "Next 5 min" : alert.probabilityScore >= 65 ? "Next 10 min" : "Watchlist"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No alerts match your filters.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
