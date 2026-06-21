import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mic, MicOff, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitAnswer, finalizeInterview } from "@/lib/interviews.functions";

export const Route = createFileRoute("/_authenticated/interview/$id")({
  component: InterviewSession,
});

type QRow = { id: string; idx: number; question: string };
type ARow = { id: string; question_id: string; text: string | null };

function InterviewSession() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const submitFn = useServerFn(submitAnswer);
  const finalizeFn = useServerFn(finalizeInterview);

  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: interview } = useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("interviews").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["interview-questions", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("questions")
        .select("id, idx, question")
        .eq("interview_id", id)
        .order("idx", { ascending: true });
      return (data ?? []) as QRow[];
    },
  });

  const { data: answers } = useQuery({
    queryKey: ["interview-answers", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("answers")
        .select("id, question_id, text")
        .eq("interview_id", id);
      return (data ?? []) as ARow[];
    },
  });

  const { data: report } = useQuery({
    queryKey: ["interview-report", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_reports")
        .select("report")
        .eq("interview_id", id)
        .maybeSingle();
      return data?.report ?? null;
    },
  });

  const currentQ = useMemo(() => {
    if (!questions?.length) return null;
    const answered = new Set(answers?.map((a) => a.question_id) ?? []);
    return questions.find((q) => !answered.has(q.id)) ?? null;
  }, [questions, answers]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!currentQ) return;
      return submitFn({ data: { interviewId: id, questionId: currentQ.id, answerText: draft.trim() } });
    },
    onSuccess: (res) => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["interview-questions", id] });
      qc.invalidateQueries({ queryKey: ["interview-answers", id] });
      if (res?.done) {
        toast.success("Interview complete. Generating report…");
        finalize.mutate();
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to submit"),
  });

  const finalize = useMutation({
    mutationFn: () => finalizeFn({ data: { interviewId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-report", id] });
      qc.invalidateQueries({ queryKey: ["interview", id] });
    },
  });

  // --- voice: record audio, then transcribe (placeholder: drop text in for now) ---
  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        // STT wiring will go through a server route next pass; placeholder:
        toast.message("Voice recorded. Speech-to-text endpoint wires up in the next module.");
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied");
    }
  }
  function stopRec() {
    recRef.current?.stop();
    setRecording(false);
  }

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  if (!interview) return <div className="p-10 text-sm text-muted-foreground">Loading session…</div>;

  const completed = interview.status === "completed";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/interviews" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            ← All interviews
          </Link>
          <h1 className="mt-2 font-display text-3xl">
            {interview.role} · <span className="text-muted-foreground capitalize">{interview.round.replace("_", " ")}</span>
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {interview.level}
            {interview.company ? ` · ${interview.company}-style` : ""}
          </p>
        </div>
        {completed && (
          <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-xs text-forest">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        )}
      </header>

      {/* Transcript */}
      <div className="space-y-4">
        {questions?.map((q) => {
          const a = answers?.find((x) => x.question_id === q.id);
          return (
            <div key={q.id} className="space-y-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-1 text-xs uppercase tracking-wider text-terracotta">Recruiter · Q{q.idx + 1}</div>
                <p className="font-display text-lg leading-relaxed">{q.question}</p>
              </div>
              {a?.text && (
                <div className="ml-6 rounded-xl border border-border bg-paper p-5">
                  <div className="mb-1 text-xs uppercase tracking-wider text-forest">You</div>
                  <p className="leading-relaxed">{a.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      {!completed && currentQ && (
        <div className="sticky bottom-4 mt-8 rounded-2xl border border-border bg-card p-4 shadow-lg">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Type your answer, or speak it out loud…"
            className="resize-none border-0 bg-transparent focus-visible:ring-0"
          />
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant={recording ? "destructive" : "outline"}
              size="sm"
              onClick={recording ? stopRec : startRec}
            >
              {recording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {recording ? "Stop" : "Record"}
            </Button>
            <Button onClick={() => submit.mutate()} disabled={!draft.trim() || submit.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {submit.isPending ? "Thinking…" : "Submit answer"}
            </Button>
          </div>
        </div>
      )}

      {/* Report */}
      {completed && (
        <div className="mt-10 space-y-6">
          {finalize.isPending && (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              <Sparkles className="mr-2 inline h-4 w-4 text-terracotta" />
              Building your feedback report…
            </div>
          )}
          {report && <ReportCard report={report as ReportShape} />}
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate({ to: "/interviews" })}>Run another</Button>
          </div>
        </div>
      )}
    </div>
  );
}

type ReportShape = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvement_plan: string[];
  hiring_recommendation: "strong_hire" | "hire" | "lean_hire" | "no_hire";
  rubric: Record<string, number>;
};

function ReportCard({ report }: { report: ReportShape }) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Hiring recommendation</div>
        <div className="mt-1 font-display text-3xl capitalize">{report.hiring_recommendation.replace("_", " ")}</div>
        <p className="mt-3 text-muted-foreground">{report.summary}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {Object.entries(report.rubric).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.replace("_", " ")}</div>
            <div className="mt-1 font-display text-2xl">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-display text-xl text-forest">Strengths</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div>
          <h3 className="mb-2 font-display text-xl text-terracotta">Watch-outs</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{report.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-display text-xl">Improvement plan</h3>
        <ul className="list-decimal space-y-1 pl-5 text-sm">{report.improvement_plan.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>
    </div>
  );
}
