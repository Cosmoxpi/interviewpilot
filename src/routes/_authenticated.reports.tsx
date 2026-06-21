import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_reports")
        .select("id, interview_id, created_at, report, interviews(role, level, round, overall_score)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Reports</p>
        <h1 className="mt-1 font-display text-4xl">Your feedback library</h1>
      </header>
      {data?.length ? (
        <div className="space-y-3">
          {data.map((r) => {
            const iv = (r as { interviews?: { role: string; level: string; round: string; overall_score: number | null } }).interviews;
            const rep = r.report as { summary?: string; hiring_recommendation?: string };
            return (
              <Link
                key={r.id}
                to="/interview/$id"
                params={{ id: r.interview_id }}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-terracotta"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-display text-xl">{iv?.role}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {iv?.round.replace("_", " ")} · {iv?.level} · score {iv?.overall_score ?? "—"}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{rep.summary}</p>
                <div className="mt-2 text-xs uppercase tracking-wider text-terracotta">
                  {rep.hiring_recommendation?.replace("_", " ")}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Complete an interview to see a report here.
        </div>
      )}
    </div>
  );
}
