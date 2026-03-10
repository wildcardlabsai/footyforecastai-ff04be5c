import { motion } from "framer-motion";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";

const TrendingPredictions = () => {
  const { data: allPredictions = [], isLoading } = usePredictionsData();
  const predictions = allPredictions.filter(p => p.confidence >= 60).slice(0, 4);

  return (
    <section className="py-24 bg-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trending <span className="text-primary">Match Predictions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Today's top predictions across Europe's biggest leagues.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="mt-12 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">No predictions available right now. Check back soon.</div>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {predictions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted-foreground">{p.leagueCountry} {p.league}</span>
                  <Badge className={`text-[10px] ${
                    p.confidenceLevel === 'high' ? 'bg-primary/20 text-primary border-primary/30' :
                    p.confidenceLevel === 'medium' ? 'bg-warning/20 text-warning border-warning/30' :
                    'bg-secondary text-muted-foreground border-border'
                  }`}>
                    {p.confidence}%
                  </Badge>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  {p.homeTeam} vs {p.awayTeam}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prediction</span>
                    <span className="font-medium text-foreground">{p.predictedResult}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-mono font-bold text-foreground">{p.predictedScore}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Over 2.5</span>
                    <span className="font-mono text-muted-foreground">{p.over25Prob}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">BTTS</span>
                    <span className={`font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingPredictions;
