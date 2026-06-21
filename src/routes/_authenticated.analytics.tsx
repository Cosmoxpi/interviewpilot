import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("created_at, overall_score, role")
        .eq("user_id", user!.id)
        .not("overall_score", "is", null)
        .order("created_at", { ascending: true });
      return (data ?? []).map((d) => ({
        date: new Date(d.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: d.overall_score,
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Analytics</p>
        <h1 className="mt-1 font-display text-4xl">Performance trend</h1>
      </header>
      <div className="h-80 rounded-xl border border-border bg-card p-6">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.012 80)" />
              <XAxis dataKey="date" stroke="oklch(0.42 0.01 60)" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="oklch(0.42 0.01 60)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="oklch(0.685 0.13 40)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Complete a few interviews to see your trend.
          </div>
        )}
      </div>
    </div>
  );
}
