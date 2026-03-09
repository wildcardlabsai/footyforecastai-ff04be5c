import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Strategies = () => (
  <DashboardLayout>
    <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Strategy Builder</h2>
        <p className="mt-2 text-sm text-muted-foreground">Custom alert strategies — coming in Phase 5</p>
      </div>
    </div>
  </DashboardLayout>
);

export default Strategies;
