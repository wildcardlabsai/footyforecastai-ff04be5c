import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Alerts = () => (
  <DashboardLayout>
    <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Alerts</h2>
        <p className="mt-2 text-sm text-muted-foreground">Full alerts history — coming in Phase 4</p>
      </div>
    </div>
  </DashboardLayout>
);

export default Alerts;
