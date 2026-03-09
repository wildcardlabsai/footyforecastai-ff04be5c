import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsWidgets from "@/components/dashboard/StatsWidgets";
import LiveMatchTable from "@/components/dashboard/LiveMatchTable";
import HotMatchesPanel from "@/components/dashboard/HotMatchesPanel";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { getDemoMatches, getDemoAlerts, getDemoStats, DemoMatch } from "@/services/demoData";
import { runPredictions, PredictionResult } from "@/services/predictionEngine";

const Dashboard = () => {
  const [matches, setMatches] = useState<DemoMatch[]>([]);
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const stats = getDemoStats();
  const alerts = getDemoAlerts();

  // Simulate live updates every 4 seconds
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
    };

    update();
    const interval = setInterval(update, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats */}
        <StatsWidgets stats={stats} />

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Live matches */}
          <div className="lg:col-span-2 space-y-6">
            <LiveMatchTable matches={matches} predictions={predictions} />
          </div>

          {/* Right: Hot matches + Alerts */}
          <div className="space-y-6">
            <HotMatchesPanel matches={matches} predictions={predictions} />
            <RecentAlerts alerts={alerts} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
