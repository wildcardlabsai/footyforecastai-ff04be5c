import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Palette, Globe, MessageCircle, Mail, Zap, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Notifications
  const [alertChannel, setAlertChannel] = useState<string>("both");
  const [alertStyle, setAlertStyle] = useState<string>("balanced");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  // Preferences
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("4");
  const [compactMode, setCompactMode] = useState(false);

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const TIMEZONES = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-secondary border border-border w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
            <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="h-3 w-3" /> Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5"><Bell className="h-3 w-3" /> Alerts</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs gap-1.5"><Palette className="h-3 w-3" /> Display</TabsTrigger>
            <TabsTrigger value="account" className="text-xs gap-1.5"><Shield className="h-3 w-3" /> Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>

              <div className="space-y-2">
                <Label className="text-xs">Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-background border-border opacity-60" />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-background border-border">
                    <Globe className="h-3 w-3 mr-2" /><SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} size="sm" className="font-semibold">Save Profile</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Alert Channels</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">Email Alerts</p>
                      <p className="text-[10px] text-muted-foreground">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-sm text-foreground">Telegram Alerts</p>
                      <p className="text-[10px] text-muted-foreground">Receive alerts via Telegram bot</p>
                    </div>
                  </div>
                  <Switch checked={telegramAlerts} onCheckedChange={setTelegramAlerts} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-sm text-foreground">Sound Alerts</p>
                      <p className="text-[10px] text-muted-foreground">Play sound when HOT match detected</p>
                    </div>
                  </div>
                  <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Alert Style</h3>
              <p className="text-xs text-muted-foreground">Controls how aggressively alerts are triggered</p>

              <div className="grid grid-cols-3 gap-2">
                {(['conservative', 'balanced', 'aggressive'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setAlertStyle(style)}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      alertStyle === style
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="text-xs font-medium capitalize">{style}</div>
                    <div className="text-[10px] mt-1 text-muted-foreground">
                      {style === 'conservative' ? 'Fewer, higher quality' : style === 'balanced' ? 'Best balance' : 'More alerts, wider net'}
                    </div>
                    {alertStyle === style && <Check className="h-3 w-3 mx-auto mt-1.5 text-primary" />}
                  </button>
                ))}
              </div>

              <Button onClick={handleSave} size="sm" className="font-semibold">Save Alert Settings</Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Display Preferences</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Auto-refresh data</p>
                  <p className="text-[10px] text-muted-foreground">Automatically update match data</p>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label className="text-xs">Refresh Interval</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger className="bg-background border-border w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Every 2 seconds</SelectItem>
                      <SelectItem value="4">Every 4 seconds</SelectItem>
                      <SelectItem value="10">Every 10 seconds</SelectItem>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Compact Mode</p>
                  <p className="text-[10px] text-muted-foreground">Reduce spacing in tables</p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>

              <Button onClick={handleSave} size="sm" className="font-semibold">Save Preferences</Button>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Subscription</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Free Plan</p>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Current</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">5 alerts/day · 2 strategies · Basic analytics</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-primary text-primary hover:bg-primary/10">Upgrade</Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <Button variant="outline" size="sm" className="text-xs">Change Password</Button>
            </div>

            <div className="rounded-xl border border-destructive/30 bg-card p-4 sm:p-6 space-y-3">
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10">Delete Account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
