import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoMatches, getDemoAlerts, DemoMatch, DemoAlert } from "@/services/demoData";
import { calculatePrediction, PredictionResult, MatchStats } from "@/services/predictionEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, AlertTriangle, Clock, Zap, Target, Radio, Shield, CornerDownRight } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine
} from "recharts";

// Generate historical timeline data for a match
function generateTimeline(match: DemoMatch, prediction: PredictionResult | null) {
  const points = [];
  const currentMin = match.minute;

  for (let m = 1; m <= currentMin; m++) {
    const factor = m / 90;
    const noise = Math.sin(m * 0.7) * 8 + Math.cos(m * 0.3) * 5;
    const baseProb = (prediction?.probabilityScore || 40) * factor + noise;
    const momentumHome = 45 + Math.sin(m * 0.15) * 20 + Math.cos(m * 0.08) * 10;

    // Simulate events
    const shotBurst = (m % 12 === 0 || m % 17 === 0) ? 8 : 0;
    const lateGameBoost = m > 65 ? (m - 65) * 0.6 : 0;

    points.push({
      minute: m,
      probability: Math.max(5, Math.min(95, Math.round(baseProb + shotBurst + lateGameBoost))),
      momentumHome: Math.round(Math.max(20, Math.min(80, momentumHome))),
      momentumAway: Math.round(Math.max(20, Math.min(80, 100 - momentumHome))),
      xgHome: Math.round(Math.random() * factor * 2.5 * 100) / 100,
      xgAway: Math.round(Math.random() * factor * 2 * 100) / 100,
    });
  }
  return points;
}

// Generate match events
function generateEvents(match: DemoMatch) {
  const events: { minute: number; type: string; team: 'home' | 'away'; description: string }[] = [];

  if (match.homeScore > 0) {
    events.push({ minute: Math.round(match.minute * 0.35), type: 'goal', team: 'home', description: `${match.homeTeam} scores!` });
  }
  if (match.homeScore > 1) {
    events.push({ minute: Math.round(match.minute * 0.7), type: 'goal', team: 'home', description: `${match.homeTeam} scores again!` });
  }
  if (match.awayScore > 0) {
    events.push({ minute: Math.round(match.minute * 0.5), type: 'goal', team: 'away', description: `${match.awayTeam} equalizer!` });
  }
  if (match.awayScore > 1) {
    events.push({ minute: Math.round(match.minute * 0.8), type: 'goal', team: 'away', description: `${match.awayTeam} scores!` });
  }

  events.push({ minute: Math.round(match.minute * 0.25), type: 'yellow', team: 'home', description: 'Yellow card' });
  events.push({ minute: Math.round(match.minute * 0.6), type: 'yellow', team: 'away', description: 'Yellow card' });
  events.push({ minute: Math.round(match.minute * 0.4), type: 'corner', team: 'home', description: 'Corner kick' });

  if (match.stats.homeRedCards > 0) {
    events.push({ minute: Math.round(match.minute * 0.75), type: 'red', team: 'home', description: 'Red card!' });
  }
  if (match.stats.awayRedCards > 0) {
    events.push({ minute: Math.round(match.minute * 0.85), type: 'red', team: 'away', description: 'Red card!' });
  }

  return events.sort((a, b) => b.minute - a.minute);
}

const StatBar = ({ label, homeValue, awayValue, homeLabel, awayLabel, highlight }: {
  label: string; homeValue: number; awayValue: number;
  homeLabel?: string; awayLabel?: string; highlight?: boolean;
}) => {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono ${highlight && homeValue > awayValue ? "text-primary font-bold" : "text-foreground"}`}>
          {homeLabel ?? homeValue}
        </span>
        <span className="text-muted-foreground text-[10px]">{label}</span>
        <span className={`font-mono ${highlight && awayValue > homeValue ? "text-primary font-bold" : "text-foreground"}`}>
          {awayLabel ?? awayValue}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div
          className={`rounded-full transition-all ${homeValue > awayValue ? "bg-primary" : homeValue === awayValue ? "bg-muted-foreground" : "bg-accent"}`}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className={`rounded-full transition-all ${awayValue > homeValue ? "bg-primary" : awayValue === homeValue ? "bg-muted-foreground" : "bg-accent"}`}
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
};

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<DemoMatch | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [allMatches, setAllMatches] = useState<DemoMatch[]>([]);
  const timelineRef = useRef<ReturnType<typeof generateTimeline>>([]);

  useEffect(() => {
    const update = () => {
      const matches = getDemoMatches();
      setAllMatches(matches);
      const found = matches.find(m => m.id === id);
      if (found) {
        setMatch(found);
        if (found.status === 'live') {
          const pred = calculatePrediction(found.stats);
          setPrediction(pred);
        }
      }
    };
    update();
    const interval = setInterval(update, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Build timeline once, then extend as minutes progress
  useEffect(() => {
    if (match && prediction) {
      timelineRef.current = generateTimeline(match, prediction);
    }
  }, [match?.minute]);

  const timeline = match && prediction ? generateTimeline(match, prediction) : [];
  const events = match ? generateEvents(match) : [];
  const matchAlerts = getDemoAlerts().filter(a => a.matchId === id);
  const liveCount = allMatches.filter(m => m.status === 'live').length;

  if (!match) {
    return (
      <DashboardLayout liveMatchCount={liveCount}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/live-matches"><Button variant="outline" size="sm" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Back to matches</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const s = match.stats;
  const prob = prediction?.probabilityScore || 0;

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        {/* Back nav */}
        <Link to="/live-matches" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Live Matches
        </Link>

        {/* Scoreboard */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-secondary/20">
            <span className="text-xs text-muted-foreground">{match.league}</span>
            <div className="flex items-center gap-2">
              {match.status === 'live' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />}
              <span className="text-xs font-mono text-muted-foreground">
                {match.status === 'halftime' ? 'HALF TIME' : match.status === 'finished' ? 'FULL TIME' : `${match.minute}'`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-8 py-6 sm:py-8 px-4">
            <div className="flex-1 text-right">
              <div className="text-sm sm:text-lg font-bold text-foreground">{match.homeTeam}</div>
              <span className="text-[10px] text-muted-foreground">Home</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-5xl font-bold font-mono text-foreground">{match.homeScore}</span>
              <span className="text-xl sm:text-3xl text-muted-foreground">–</span>
              <span className="text-3xl sm:text-5xl font-bold font-mono text-foreground">{match.awayScore}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm sm:text-lg font-bold text-foreground">{match.awayTeam}</div>
              <span className="text-[10px] text-muted-foreground">Away</span>
            </div>
          </div>

          {/* Prediction bar */}
          {prediction && (
            <div className="border-t border-border/50 px-4 py-3 bg-secondary/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 ${prediction.triggerStatus ? "text-primary" : prob >= 50 ? "text-warning" : "text-muted-foreground"}`}>
                    {prediction.triggerStatus ? <TrendingUp className="h-4 w-4" /> : prob >= 50 ? <AlertTriangle className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    <span className={`text-2xl font-bold font-mono ${prob >= 70 ? "text-primary text-glow-green" : prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>
                      {prob}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Goal Probability</p>
                    <p className="text-[10px] text-muted-foreground">{prediction.goalWindow}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-[10px] ${
                    prediction.confidence === 'very_high' ? "bg-primary/20 text-primary border-primary/30" :
                    prediction.confidence === 'high' ? "bg-accent/20 text-accent border-accent/30" :
                    prediction.confidence === 'medium' ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-secondary text-muted-foreground border-border"
                  }`}>
                    {prediction.confidence.replace('_', ' ')}
                  </Badge>
                  {prediction.activeSignals.slice(0, 3).map(sig => (
                    <span key={sig} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{sig.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
              {prediction.reasonSummary && (
                <p className="mt-2 text-xs text-muted-foreground italic">{prediction.reasonSummary}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left column — Charts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Goal Probability Timeline */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Goal Probability Timeline
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 8%, 14%)" />
                  <XAxis dataKey="minute" tick={{ fill: 'hsl(160, 8%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(160, 8%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: 'hsl(160, 12%, 6%)', border: '1px solid hsl(160, 8%, 14%)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, 'Probability']}
                  />
                  <defs>
                    <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(90, 85%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(90, 85%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <ReferenceLine y={62} stroke="hsl(38, 92%, 50%)" strokeDasharray="5 5" strokeOpacity={0.5} />
                  <Area type="monotone" dataKey="probability" stroke="hsl(90, 85%, 45%)" fill="url(#probGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-primary rounded" /> Probability</div>
                <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-warning rounded border-dashed" style={{ borderTop: '1px dashed' }} /> Alert Threshold (62%)</div>
              </div>
            </div>

            {/* Momentum Chart */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" /> Momentum Flow
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 8%, 14%)" />
                  <XAxis dataKey="minute" tick={{ fill: 'hsl(160, 8%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(160, 8%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ background: 'hsl(160, 12%, 6%)', border: '1px solid hsl(160, 8%, 14%)', borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={50} stroke="hsl(160, 8%, 25%)" strokeDasharray="3 3" />
                  <defs>
                    <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(90, 85%, 45%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(90, 85%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="awayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(180, 85%, 45%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(180, 85%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="momentumHome" stroke="hsl(90, 85%, 45%)" fill="url(#homeGrad)" strokeWidth={2} dot={false} name={match.homeTeam} />
                  <Area type="monotone" dataKey="momentumAway" stroke="hsl(180, 85%, 45%)" fill="url(#awayGrad)" strokeWidth={1.5} dot={false} name={match.awayTeam} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> {match.homeTeam}</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-accent" /> {match.awayTeam}</div>
              </div>
            </div>

            {/* Factor Breakdown */}
            {prediction && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Prediction Factor Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(prediction.factorBreakdown).map(([key, value]) => {
                    const maxVal = 14;
                    const percent = Math.min(100, (value / maxVal) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono text-foreground">{value}</span>
                        </div>
                        <div className="h-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${value >= 10 ? "bg-primary" : value >= 6 ? "bg-accent" : "bg-muted-foreground"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Stats & Events */}
          <div className="space-y-4">
            {/* Match Stats */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent" /> Match Stats
              </h3>
              <div className="space-y-3">
                <StatBar label="Possession" homeValue={s.homePossession} awayValue={s.awayPossession} homeLabel={`${s.homePossession}%`} awayLabel={`${s.awayPossession}%`} />
                <StatBar label="Shots" homeValue={s.homeShots} awayValue={s.awayShots} highlight />
                <StatBar label="Shots on Target" homeValue={s.homeShotsOnTarget} awayValue={s.awayShotsOnTarget} highlight />
                <StatBar label="Dangerous Attacks" homeValue={s.homeDangerousAttacks} awayValue={s.awayDangerousAttacks} highlight />
                <StatBar label="Corners" homeValue={s.homeCorners} awayValue={s.awayCorners} />
                <StatBar label="xG" homeValue={Math.round(s.homeXg * 100)} awayValue={Math.round(s.awayXg * 100)} homeLabel={s.homeXg.toFixed(2)} awayLabel={s.awayXg.toFixed(2)} highlight />
                <StatBar label="Yellow Cards" homeValue={s.homeYellowCards} awayValue={s.awayYellowCards} />
                <StatBar label="Red Cards" homeValue={s.homeRedCards} awayValue={s.awayRedCards} />
                <StatBar label="Momentum" homeValue={s.momentumHome} awayValue={s.momentumAway} homeLabel={`${s.momentumHome}%`} awayLabel={`${s.momentumAway}%`} />
              </div>
            </div>

            {/* Event Feed */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Match Events
              </h3>
              <div className="space-y-2">
                {events.map((event, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[10px] font-mono text-muted-foreground w-6 shrink-0 text-right">{event.minute}'</span>
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                      event.type === 'goal' ? 'bg-primary/20' :
                      event.type === 'red' ? 'bg-destructive/20' :
                      event.type === 'yellow' ? 'bg-warning/20' :
                      'bg-secondary'
                    }`}>
                      {event.type === 'goal' ? <Zap className="h-2.5 w-2.5 text-primary" /> :
                       event.type === 'red' ? <Shield className="h-2.5 w-2.5 text-destructive" /> :
                       event.type === 'yellow' ? <Shield className="h-2.5 w-2.5 text-warning" /> :
                       <CornerDownRight className="h-2.5 w-2.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs ${event.type === 'goal' ? 'text-primary font-semibold' : 'text-foreground'}`}>
                        {event.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{event.team === 'home' ? match.homeTeam : match.awayTeam}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Alerts */}
            {matchAlerts.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" /> Alerts for this match
                </h3>
                <div className="space-y-2">
                  {matchAlerts.map(alert => (
                    <div key={alert.id} className="rounded-lg bg-secondary/20 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">{alert.minute}'</span>
                        <span className={`text-sm font-bold font-mono ${alert.probabilityScore >= 75 ? "text-primary" : "text-accent"}`}>{alert.probabilityScore}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{alert.reason}</p>
                      <div className="mt-1">
                        <Badge className={`text-[9px] ${
                          alert.result === 'goal_scored' ? "bg-primary/20 text-primary border-primary/30" :
                          alert.result === 'no_goal' ? "bg-destructive/20 text-destructive border-destructive/30" :
                          "bg-warning/20 text-warning border-warning/30"
                        }`}>
                          {alert.result === 'goal_scored' ? '✓ Goal scored' : alert.result === 'no_goal' ? '✗ No goal' : '⏳ Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MatchDetail;
