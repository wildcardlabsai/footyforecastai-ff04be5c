import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoMatches, DemoMatch } from "@/services/demoData";
import { runPredictions, PredictionResult } from "@/services/predictionEngine";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const getConfBadge = (conf: string) => {
  switch (conf) {
    case 'very_high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Very High</Badge>;
    case 'high': return <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

const LiveMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<DemoMatch[]>([]);
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");

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
    return true;
  });

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Matches</h1>
            <p className="text-xs text-muted-foreground mt-1">{liveCount} matches live · Auto-refreshing</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-mono text-primary">LIVE</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teams or leagues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border" />
          </div>
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-card border-border"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="All Leagues" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">League</th>
                  <th className="px-4 py-3 text-left font-medium">Match</th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-center font-medium">Min</th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">xG</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} onClick={() => navigate(`/match/${m.id}`)} className="border-b border-border/20 transition-colors hover:bg-secondary/20 cursor-pointer">
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{m.league}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{m.homeTeam} vs {m.awayTeam}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{m.homeScore}-{m.awayScore}</td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">{m.status === 'halftime' ? 'HT' : m.status === 'finished' ? 'FT' : `${m.minute}'`}</td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground hidden sm:table-cell">{(m.stats.homeXg + m.stats.awayXg).toFixed(1)}</td>
                    <td className="px-4 py-3 text-center">
                      {m.status === 'live' ? (
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                          <span className="text-[10px] font-semibold">LIVE</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{m.status === 'halftime' ? 'HT' : 'FT'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No matches found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveMatches;
