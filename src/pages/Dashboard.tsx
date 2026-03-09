import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsWidgets from "@/components/dashboard/StatsWidgets";
import LiveMatchTable from "@/components/dashboard/LiveMatchTable";
import HotMatchesPanel from "@/components/dashboard/HotMatchesPanel";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import WatchedGamesPanel from "@/components/dashboard/WatchedGamesPanel";
import { getDemoMatches, getDemoAlerts, getDemoStats, DemoMatch } from "@/services/demoData";
import { runPredictions, PredictionResult } from "@/services/predictionEngine";

const Dashboard = () => {
  const [matches, setMatches] = useState<DemoMatch[]>([]);
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const stats = getDemoStats();
  const alerts = getDemoAlerts();

  useEffect(() => {
    const update = () => {
      const demoMatches = getDemoMatches();
      setMatches(demoMatches);

      const allStats = demoMatches
        .filter((m) => m.status === 'live')
        .map((m) => m.stats);

      const results = runPredictions(allStats);
      const predMap = new Map<string, PredictionResult>();
      results.forEach((r) => predMap.set(r.matchId, r));
      setPredictions(predMap);
      setLastUpdated(new Date());
    };

    update();
    const interval = setInterval(update, 4000);
    return () => clearInterval(interval);
  }, []);

  const liveCount = matches.filter(m => m.status === 'live').length;

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4 sm:space-y-6">
        <StatsWidgets stats={stats} />

        {/* Refresh indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          Auto-refreshing · Last updated {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Main content grid - stacks on mobile */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <LiveMatchTable matches={matches} predictions={predictions} />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <WatchedGamesPanel matches={matches} predictions={predictions} />
            <HotMatchesPanel matches={matches} predictions={predictions} />
            <RecentAlerts alerts={alerts} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
