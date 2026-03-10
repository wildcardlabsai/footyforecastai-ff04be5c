import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Loader2, Calendar } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";

const getConfBadge = (level: string) => {
  switch (level) {
    case 'high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

const formatMatchDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} ${time}`;
};

const WinProbBar = ({ home, draw, away, homeTeam, awayTeam }: { home: number; draw: number; away: number; homeTeam: string; awayTeam: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[10px]">
      <span className={`font-bold ${home >= draw && home >= away ? 'text-primary' : 'text-foreground'}`}>{homeTeam} {home}%</span>
      <span className="text-muted-foreground">Draw {draw}%</span>
      <span className={`font-bold ${away >= draw && away >= home ? 'text-primary' : 'text-foreground'}`}>{away}% {awayTeam}</span>
    </div>
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      <div className={`rounded-l-full ${home >= draw && home >= away ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${home}%` }} />
      <div className="bg-muted-foreground/30" style={{ width: `${draw}%` }} />
      <div className={`rounded-r-full ${away >= draw && away >= home ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${away}%` }} />
    </div>
  </div>
);

const Predictions = () => {
  const { data: predictions = [], isLoading, error } = usePredictionsData();
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [confFilter, setConfFilter] = useState("all");
  const [sortKey, setSortKey] = useState<'confidence' | 'league'>('confidence');
  const [sortAsc, setSortAsc] = useState(false);

  const leagues = [...new Set(predictions.map(p => p.league))].sort();

  let filtered = predictions.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.homeTeam.toLowerCase().includes(q) && !p.awayTeam.toLowerCase().includes(q) && !p.league.toLowerCase().includes(q)) return false;
    }
    if (leagueFilter !== "all" && p.league !== leagueFilter) return false;
    if (confFilter !== "all" && p.confidenceLevel !== confFilter) return false;
    return true;
  });

  filtered.sort((a, b) => {
    let cmp = sortKey === 'confidence' ? b.confidence - a.confidence : a.league.localeCompare(b.league);
    return sortAsc ? -cmp : cmp;
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Predictions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${predictions.length} matches predicted · ML-powered data`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teams or leagues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border" />
          </div>
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-card border-border"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="All Leagues" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs bg-card border-border"><SelectValue placeholder="All Confidence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load predictions. Please try again later.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">
                        <button onClick={() => handleSort('league')} className="flex items-center gap-1 hover:text-foreground">League <ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Match</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-center font-medium">Win Probabilities</th>
                      <th className="px-4 py-3 text-center font-medium">
                        <button onClick={() => handleSort('confidence')} className="flex items-center gap-1 hover:text-foreground mx-auto">Conf. <ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-center font-medium">Score</th>
                      <th className="px-4 py-3 text-center font-medium">BTTS</th>
                      <th className="px-4 py-3 text-center font-medium">O2.5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b border-border/20 transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{p.league}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground"><TeamBadge name={p.homeTeam} logo={p.homeLogo} size={14} /></div>
                          <div className="font-medium text-foreground mt-0.5"><TeamBadge name={p.awayTeam} logo={p.awayLogo} size={14} /></div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[10px] whitespace-nowrap">{formatMatchDate(p.matchDate)}</td>
                        <td className="px-4 py-3 min-w-[200px]">
                          <WinProbBar home={p.homeWinProb} draw={p.drawProb} away={p.awayWinProb} homeTeam="H" awayTeam="A" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-mono font-bold ${p.confidence >= 80 ? 'text-primary' : p.confidence >= 60 ? 'text-warning' : 'text-muted-foreground'}`}>{p.confidence}%</span>
                            {getConfBadge(p.confidenceLevel)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{p.predictedScore}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">{p.over25Prob}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No predictions match your filters.</div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No predictions match your filters.</div>
              )}
              {filtered.map(p => (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{p.league}</span>
                    {getConfBadge(p.confidenceLevel)}
                  </div>

                  {/* Match date */}
                  {p.status === 'scheduled' && p.matchDate && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatMatchDate(p.matchDate)}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate"><TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} /></div>
                    </div>
                    <div className="text-center shrink-0 px-2">
                      <div className="text-lg font-mono font-bold text-foreground">{p.predictedScore}</div>
                      <div className="text-[10px] text-muted-foreground">predicted</div>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm font-semibold text-foreground truncate flex justify-end"><TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} /></div>
                    </div>
                  </div>

                  {/* Win probability bar */}
                  <WinProbBar home={p.homeWinProb} draw={p.drawProb} away={p.awayWinProb} homeTeam={p.homeTeam.split(' ').pop() || 'Home'} awayTeam={p.awayTeam.split(' ').pop() || 'Away'} />

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Result</div>
                      <div className="text-xs font-medium text-foreground">{p.predictedResult}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">BTTS</div>
                      <div className={`text-xs font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">O2.5</div>
                      <div className="text-xs font-mono text-muted-foreground">{p.over25Prob}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">Confidence</span>
                    <span className={`font-mono font-bold text-xs ${p.confidence >= 80 ? 'text-primary' : p.confidence >= 60 ? 'text-warning' : 'text-muted-foreground'}`}>{p.confidence}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${p.confidence >= 80 ? 'bg-primary' : p.confidence >= 60 ? 'bg-accent' : 'bg-muted-foreground'}`} style={{ width: `${p.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only. Not financial advice.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Predictions;
