import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoMatches, DemoMatch } from "@/services/demoData";
import { runPredictions, PredictionResult } from "@/services/predictionEngine";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, AlertTriangle, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const getConfBadge = (conf: string) => {
  switch (conf) {
    case 'very_high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Very High</Badge>;
    case 'high': return <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

type SortKey = 'prob' | 'minute' | 'league';

const LiveMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<DemoMatch[]>([]);
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [confFilter, setConfFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>('prob');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const update = () => {
      const demoMatches = getDemoMatches();
      setMatches(demoMatches);
      const allStats = demoMatches.filter(m => m.status === 'live').map(m => m.stats);
      const results = runPredictions(allStats);
      const predMap = new Map<string, PredictionResult>();
      results.forEach(r => predMap.set(r.matchId, r));
      setPredictions(predMap);
    };
    update();
    const interval = setInterval(update, 4000);
    return () => clearInterval(interval);
  }, []);

  const leagues = [...new Set(matches.map(m => m.league))].sort();
  const liveCount = matches.filter(m => m.status === 'live').length;

  let filtered = matches.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q) && !m.league.toLowerCase().includes(q)) return false;
    }
    if (leagueFilter !== "all" && m.league !== leagueFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (confFilter !== "all") {
      const pred = predictions.get(m.id);
      if (!pred || pred.confidence !== confFilter) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'prob') {
      cmp = (predictions.get(b.id)?.probabilityScore || 0) - (predictions.get(a.id)?.probabilityScore || 0);
    } else if (sortKey === 'minute') {
      cmp = b.minute - a.minute;
    } else if (sortKey === 'league') {
      cmp = a.league.localeCompare(b.league);
    }
    return sortAsc ? -cmp : cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Matches</h1>
            <p className="text-xs text-muted-foreground mt-1">{liveCount} matches currently live · Auto-refreshing every 4s</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-mono text-primary">LIVE</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or leagues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-card border-border"
            />
          </div>
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-card border-border">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs bg-card border-border">
              <SelectValue placeholder="All Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="very_high">Very High</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-card border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="halftime">Halftime</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">
                    <button onClick={() => handleSort('league')} className="flex items-center gap-1 hover:text-foreground">
                      League <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Match</th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-center font-medium">
                    <button onClick={() => handleSort('minute')} className="flex items-center gap-1 hover:text-foreground mx-auto">
                      Min <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    <Tooltip><TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/50">SOT</TooltipTrigger><TooltipContent>Shots on Target</TooltipContent></Tooltip>
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    <Tooltip><TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/50">DA</TooltipTrigger><TooltipContent>Dangerous Attacks</TooltipContent></Tooltip>
                  </th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Corners</th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Poss</th>
                  <th className="px-4 py-3 text-center font-medium hidden md:table-cell">xG</th>
                  <th className="px-4 py-3 text-center font-medium">
                    <button onClick={() => handleSort('prob')} className="flex items-center gap-1 hover:text-foreground mx-auto">
                      Prob. <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Conf.</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const pred = predictions.get(m.id);
                  const prob = pred?.probabilityScore || 0;
                  const isHot = pred?.triggerStatus;
                  return (
                    <tr key={m.id} onClick={() => navigate(`/match/${m.id}`)} className={`border-b border-border/20 transition-colors hover:bg-secondary/20 cursor-pointer ${isHot ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{m.league}</td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        <span className="hidden sm:inline">{m.homeTeam} vs {m.awayTeam}</span>
                        <span className="sm:hidden">{m.homeTeam.split(' ').pop()} v {m.awayTeam.split(' ').pop()}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{m.homeScore}-{m.awayScore}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.status === 'halftime' ? 'HT' : m.status === 'finished' ? 'FT' : `${m.minute}'`}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.stats.homeShotsOnTarget + m.stats.awayShotsOnTarget}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.stats.homeDangerousAttacks + m.stats.awayDangerousAttacks}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden sm:table-cell">{m.stats.homeCorners + m.stats.awayCorners}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden sm:table-cell">{m.stats.homePossession}%</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden md:table-cell">{(m.stats.homeXg + m.stats.awayXg).toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden hidden sm:block">
                            <div className={`h-full rounded-full transition-all ${prob >= 70 ? "bg-primary" : prob >= 50 ? "bg-accent" : "bg-muted-foreground"}`} style={{ width: `${prob}%` }} />
                          </div>
                          <span className={`font-mono font-bold ${prob >= 70 ? "text-primary" : prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>{prob}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{pred && getConfBadge(pred.confidence)}</td>
                      <td className="px-4 py-3 text-center">
                        {isHot ? (
                          <div className="flex items-center justify-center gap-1 text-primary">
                            <TrendingUp className="h-3 w-3" /><span className="text-[10px] font-semibold">HOT</span>
                          </div>
                        ) : pred && pred.probabilityScore >= 50 ? (
                          <div className="flex items-center justify-center gap-1 text-watch">
                            <AlertTriangle className="h-3 w-3" /><span className="text-[10px]">WATCH</span>
                          </div>
                        ) : m.status === 'halftime' ? (
                          <span className="text-[10px] text-muted-foreground">HT</span>
                        ) : m.status === 'finished' ? (
                          <span className="text-[10px] text-muted-foreground">FT</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matches found matching your filters.
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Showing {filtered.length} of {matches.length} matches · Data refreshes every 4 seconds
        </p>
      </div>
    </DashboardLayout>
  );
};

export default LiveMatches;
