import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDemoPredictions } from "@/services/demoPredictions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const getConfBadge = (level: string) => {
  switch (level) {
    case 'high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

const Predictions = () => {
  const predictions = useMemo(() => getDemoPredictions(), []);
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
          <p className="text-xs text-muted-foreground mt-1">{predictions.length} matches predicted · Updated daily</p>
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
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs bg-card border-border"><SelectValue placeholder="All Confidence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">
                    <button onClick={() => handleSort('league')} className="flex items-center gap-1 hover:text-foreground">League <ArrowUpDown className="h-3 w-3" /></button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Home</th>
                  <th className="px-4 py-3 text-left font-medium">Away</th>
                  <th className="px-4 py-3 text-center font-medium">Prediction</th>
                  <th className="px-4 py-3 text-center font-medium">
                    <button onClick={() => handleSort('confidence')} className="flex items-center gap-1 hover:text-foreground mx-auto">Conf. <ArrowUpDown className="h-3 w-3" /></button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">BTTS</th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">O2.5</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/20 transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{p.league}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.homeTeam}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.awayTeam}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{p.predictedResult}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-mono font-bold ${p.confidence >= 80 ? 'text-primary' : p.confidence >= 60 ? 'text-warning' : 'text-muted-foreground'}`}>{p.confidence}%</span>
                        {getConfBadge(p.confidenceLevel)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{p.predictedScore}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell font-mono text-muted-foreground">{p.over25Prob}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No predictions match your filters.</div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only. Not financial advice.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Predictions;
