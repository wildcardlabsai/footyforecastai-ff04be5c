import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Radio, BarChart3, Bell, Sliders,
  Settings, LogOut, ChevronLeft, ChevronRight, TrendingUp, Menu, X
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
  liveMatchCount?: number;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Radio, label: "Live Matches", path: "/live-matches" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: Sliders, label: "Strategies", path: "/strategies" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SidebarContent = ({
  collapsed,
  location,
  onSignOut,
  onToggle,
  onNavClick,
}: {
  collapsed: boolean;
  location: ReturnType<typeof useLocation>;
  onSignOut: () => void;
  onToggle?: () => void;
  onNavClick?: () => void;
}) => (
  <>
    {/* Logo */}
    <div className="flex h-14 items-center justify-between border-b border-border px-3">
      {!collapsed && (
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-sm font-bold text-foreground">
            GoalPulse<span className="text-primary"> AI</span>
          </span>
        </Link>
      )}
      {collapsed && (
        <Logo size="sm" className="mx-auto" />
      )}
    </div>

    {/* Live indicator */}
    <div className={cn("flex items-center gap-2 border-b border-border px-3 py-2", collapsed && "justify-center")}>
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
      {!collapsed && <span className="text-xs font-mono text-primary">LIVE — DEMO MODE</span>}
    </div>

    {/* Nav items */}
    <nav className="flex-1 space-y-1 p-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>

    {/* Bottom */}
    <div className="border-t border-border p-2 space-y-1">
      <button
        onClick={onSignOut}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
          collapsed && "justify-center px-2"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
      {onToggle && (
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </div>
  </>
);

const DashboardLayout = ({ children, liveMatchCount }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          location={location}
          onSignOut={handleSignOut}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-card border-border md:hidden">
          <div className="flex h-full flex-col">
            <SidebarContent
              collapsed={false}
              location={location}
              onSignOut={handleSignOut}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className={cn("flex-1 transition-all duration-300", collapsed ? "md:ml-16" : "md:ml-60")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {navItems.find(n => n.path === location.pathname)?.label || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              {liveMatchCount ?? 18} matches live
            </div>
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
