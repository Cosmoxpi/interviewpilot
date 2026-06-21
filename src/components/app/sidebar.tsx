import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Mic, ClipboardCheck, Map, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/resumes", label: "Resume", icon: FileText },
  { to: "/interviews", label: "Interviews", icon: Mic },
  { to: "/reports", label: "Reports", icon: ClipboardCheck },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="inline-block h-2 w-2 rounded-full bg-terracotta" />
        <span className="font-display text-lg font-semibold">InterviewPilot</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="mb-3 truncate text-xs text-muted-foreground">{user?.email}</div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
