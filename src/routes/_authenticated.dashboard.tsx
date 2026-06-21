import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Mic, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [interviews, resumes, reports] = await Promise.all([
        supabase.from("interviews").select("id, overall_score, status").eq("user_id", user!.id),
        supabase.from("resumes").select("id").eq("user_id", user!.id),
        supabase.from("feedback_reports").select("id").eq("user_id", user!.id),
      ]);
      const done = interviews.data?.filter((i) => i.status === "completed") ?? [];
      const avg = done.length
        ? Math.round(done.reduce((s, i) => s + (i.overall_score ?? 0), 0) / done.length)
        : null;
      return {
        totalInterviews: interviews.data?.length ?? 0,
        completed: done.length,
        avgScore: avg,
        resumes: resumes.data?.length ?? 0,
        reports: reports.data?.length ?? 0,
      };
    },
    enabled: !!user,
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-interviews", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("id, role, level, round, status, overall_score, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl">Ready for another round?</h1>
        </div>
        <Button asChild>
          <Link to="/interviews">Start new interview <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Interviews" value={stats?.totalInterviews ?? 0} />
        <Stat label="Completed" value={stats?.completed ?? 0} />
        <Stat label="Avg score" value={stats?.avgScore != null ? `${stats.avgScore}` : "—"} />
        <Stat label="Reports" value={stats?.reports ?? 0} />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <QuickCard to="/resumes" icon={FileText} title="Upload resume" body="Get an ATS score and missing-skill gaps." />
        <QuickCard to="/interviews" icon={Mic} title="Mock interview" body="Pick a role, round, and difficulty." />
        <QuickCard to="/reports" icon={ClipboardCheck} title="Read a report" body="Rubric scores and hiring rec." />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl">Recent interviews</h2>
        {recent && recent.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.role} <span className="text-muted-foreground">· {r.level}</span></td>
                    <td className="px-4 py-3 capitalize">{r.round.replace("_", " ")}</td>
                    <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">{r.overall_score ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/interview/$id" params={{ id: r.id }} className="text-terracotta hover:underline">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            You haven't run an interview yet. <Link to="/interviews" className="text-terracotta hover:underline">Start one →</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}

function QuickCard({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-terracotta">
      <Icon className="h-5 w-5 text-terracotta" />
      <div className="mt-4 font-display text-xl">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
      <div className="mt-4 inline-flex items-center text-sm text-terracotta">
        Open <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
