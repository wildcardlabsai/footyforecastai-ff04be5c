import { DemoAlert } from "@/services/demoData";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, Clock, Mail, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  alerts: DemoAlert[];
}

const getResultBadge = (result: string) => {
  switch (result) {
    case 'goal_scored': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] gap-1"><Check className="h-2.5 w-2.5" />Goal</Badge>;
    case 'no_goal': return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px] gap-1"><X className="h-2.5 w-2.5" />No Goal</Badge>;
    default: return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px] gap-1"><Clock className="h-2.5 w-2.5" />Pending</Badge>;
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'telegram': return <MessageCircle className="h-3 w-3 text-accent" />;
    case 'email': return <Mail className="h-3 w-3 text-muted-foreground" />;
    default: return <div className="flex gap-0.5"><MessageCircle className="h-3 w-3 text-accent" /><Mail className="h-3 w-3 text-muted-foreground" /></div>;
  }
};

const RecentAlerts = ({ alerts }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bell className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
      </div>

      <div className="divide-y divide-border/30">
        {alerts.map((alert) => (
          <div key={alert.id} className="px-4 py-3 hover:bg-secondary/10 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{alert.league}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {alert.homeTeam} vs {alert.awayTeam}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
                  {alert.reason}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`font-mono text-sm font-bold ${alert.probabilityScore >= 75 ? "text-primary" : "text-accent"}`}>
                  {alert.probabilityScore}%
                </span>
                {getResultBadge(alert.result)}
                <div className="flex items-center gap-1">
                  {getChannelIcon(alert.channel)}
                  <span className="text-[10px] text-muted-foreground">{alert.minute}'</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
