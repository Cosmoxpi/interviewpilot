import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startInterview } from "@/lib/interviews.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  component: InterviewsPage,
});

const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "AI Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
];
const COMPANIES = ["—", "Google", "Amazon", "Microsoft", "OpenAI", "Meta", "Netflix", "Anthropic"];

function InterviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startFn = useServerFn(startInterview);

  const [role, setRole] = useState(ROLES[0]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [round, setRound] = useState<"hr" | "technical" | "system_design" | "behavioral">("technical");
  const [company, setCompany] = useState("—");
  const [resumeId, setResumeId] = useState<string>("none");

  const { data: resumes } = useQuery({
    queryKey: ["resumes-pick", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("resumes").select("id,file_name").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: list } = useQuery({
    queryKey: ["interviews-list", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("id, role, level, round, status, overall_score, created_at, company")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const start = useMutation({
    mutationFn: () =>
      startFn({
        data: {
          role,
          level,
          round,
          company: company === "—" ? undefined : company,
          resumeId: resumeId === "none" ? undefined : resumeId,
        },
      }),
    onSuccess: (res) => navigate({ to: "/interview/$id", params: { id: res.interviewId } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to start"),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Interviews</p>
        <h1 className="mt-1 font-display text-4xl">Start a new round</h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Pick label="Role">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Pick>
          <Pick label="Level">
            <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Pick>
          <Pick label="Round">
            <Select value={round} onValueChange={(v) => setRound(v as typeof round)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="system_design">System Design</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
              </SelectContent>
            </Select>
          </Pick>
          <Pick label="Company style">
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COMPANIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Pick>
          <Pick label="Use resume">
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {resumes?.map((r) => <SelectItem key={r.id} value={r.id}>{r.file_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Pick>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => start.mutate()} disabled={start.isPending} size="lg">
            <Play className="mr-2 h-4 w-4" />
            {start.isPending ? "Preparing interviewer…" : "Begin interview"}
          </Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl">Past sessions</h2>
        {list?.length ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.role} <span className="text-muted-foreground">· {r.level}</span></td>
                    <td className="px-4 py-3 capitalize">{r.round.replace("_", " ")}</td>
                    <td className="px-4 py-3">{r.company ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">{r.overall_score ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/interview/$id" params={{ id: r.id }} className="text-terracotta hover:underline">Open →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No sessions yet. Set up your first interview above.
          </div>
        )}
      </section>
    </div>
  );
}

function Pick({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
