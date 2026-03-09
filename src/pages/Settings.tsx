import DashboardLayout from "@/components/dashboard/DashboardLayout";

const SettingsPage = () => (
  <DashboardLayout>
    <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">User settings — coming in Phase 6</p>
      </div>
    </div>
  </DashboardLayout>
);

export default SettingsPage;
