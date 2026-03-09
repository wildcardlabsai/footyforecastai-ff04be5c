import { motion } from "framer-motion";

const leagues = [
  { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "La Liga", flag: "🇪🇸" },
  { name: "Bundesliga", flag: "🇩🇪" },
  { name: "Serie A", flag: "🇮🇹" },
  { name: "Ligue 1", flag: "🇫🇷" },
  { name: "Eredivisie", flag: "🇳🇱" },
  { name: "Primeira Liga", flag: "🇵🇹" },
  { name: "Champions League", flag: "🏆" },
  { name: "Europa League", flag: "🏆" },
  { name: "MLS", flag: "🇺🇸" },
  { name: "Brasileiro Série A", flag: "🇧🇷" },
  { name: "Argentine Primera", flag: "🇦🇷" },
  { name: "Saudi Pro League", flag: "🇸🇦" },
  { name: "Turkish Süper Lig", flag: "🇹🇷" },
  { name: "Scottish Premiership", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Belgian Pro League", flag: "🇧🇪" },
  { name: "Austrian Bundesliga", flag: "🇦🇹" },
  { name: "Swiss Super League", flag: "🇨🇭" },
  { name: "Danish Superliga", flag: "🇩🇰" },
  { name: "J1 League", flag: "🇯🇵" },
];

const LeaguesSection = () => {
  return (
    <section id="leagues" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <span className="text-primary">40+</span> Leagues. Global Coverage.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From Europe's elite to South America's passion leagues. GoalPulse scans them all with equal precision.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {leagues.map((league, i) => (
            <motion.div
              key={league.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-primary/5 hover:-translate-y-0.5"
            >
              <span className="mr-2">{league.flag}</span>
              {league.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LeaguesSection;
