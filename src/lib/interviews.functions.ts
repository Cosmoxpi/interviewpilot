import { createServerFn } from "@tanstack/react-start";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const INTERVIEWER_SYSTEM = `You are an experienced senior interviewer at a top tech company.
Conduct realistic, adaptive interviews. Be conversational but rigorous.
Ask ONE focused question at a time. Build follow-ups from prior answers.
Match difficulty to candidate level. Stay strictly on-topic.`;

// ---------- Start an interview (creates row + first question) ----------
export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        role: z.string().min(1),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        round: z.enum(["hr", "technical", "system_design", "behavioral"]),
        company: z.string().optional(),
        resumeId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let resumeSummary = "";
    if (data.resumeId) {
      const { data: r } = await supabase.from("resumes").select("raw_text").eq("id", data.resumeId).maybeSingle();
      if (r?.raw_text) resumeSummary = r.raw_text.slice(0, 4000);
    }

    const { text } = await generateText({
      model: gateway()(MODEL),
      system: INTERVIEWER_SYSTEM,
      prompt: `Start a ${data.round} interview for a ${data.level} ${data.role}${data.company ? ` at ${data.company}` : ""}.
Open with a brief friendly greeting (one short sentence) then ONE opening question appropriate for the round.
${resumeSummary ? `Candidate resume excerpt:\n${resumeSummary}` : ""}
Respond with only the greeting + question. No preamble like "Sure!" — just speak as the interviewer.`,
    });

    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        user_id: userId,
        role: data.role,
        level: data.level,
        round: data.round,
        company: data.company ?? null,
        resume_id: data.resumeId ?? null,
        status: "in_progress",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: q, error: qErr } = await supabase
      .from("questions")
      .insert({ interview_id: interview.id, user_id: userId, idx: 0, question: text, category: data.round })
      .select()
      .single();
    if (qErr) throw new Error(qErr.message);

    return { interviewId: interview.id, question: q };
  });

// ---------- Submit an answer: evaluate + generate next question ----------
// Keep schema minimal — Gemini structured-output state machine rejects
// schemas with many bounded numbers. Validate ranges in code instead.
const ScoreSchema = z.object({
  communication: z.number(),
  technical: z.number(),
  problem_solving: z.number(),
  confidence: z.number(),
  clarity: z.number(),
  depth: z.number(),
  relevance: z.number(),
  industry: z.number(),
  overall: z.number(),
  feedback: z.string(),
});

function clampScore(n: unknown): number {
  const v = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(100, v));
}

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        interviewId: z.string().uuid(),
        questionId: z.string().uuid(),
        answerText: z.string().min(1).max(8000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: interview, error: iErr } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", data.interviewId)
      .single();
    if (iErr || !interview) throw new Error("Interview not found");

    const { data: question } = await supabase.from("questions").select("*").eq("id", data.questionId).single();
    if (!question) throw new Error("Question not found");

    // Save answer
    const { data: answer, error: aErr } = await supabase
      .from("answers")
      .insert({
        question_id: data.questionId,
        interview_id: data.interviewId,
        user_id: userId,
        text: data.answerText,
      })
      .select()
      .single();
    if (aErr) throw new Error(aErr.message);

    // Evaluate
    const { object: raw } = await generateObject({
      model: gateway()(MODEL),
      schema: ScoreSchema,
      system: `You are a strict but fair senior interviewer. Score the candidate answer on each rubric as an integer between 0 and 100, and write 1-2 sentences of feedback. Be honest, not flattering.`,
      prompt: `Role: ${interview.role} (${interview.level}, ${interview.round})
Question: ${question.question}
Candidate answer: ${data.answerText}`,
    });

    const score = {
      communication: clampScore(raw.communication),
      technical: clampScore(raw.technical),
      problem_solving: clampScore(raw.problem_solving),
      confidence: clampScore(raw.confidence),
      clarity: clampScore(raw.clarity),
      depth: clampScore(raw.depth),
      relevance: clampScore(raw.relevance),
      industry: clampScore(raw.industry),
      overall: clampScore(raw.overall),
      feedback: String(raw.feedback ?? ""),
    };

    await supabase.from("scores").insert({
      answer_id: answer.id,
      interview_id: data.interviewId,
      user_id: userId,
      ...score,
    });

    // Fetch transcript so far (to adapt next question)
    const { data: prev } = await supabase
      .from("questions")
      .select("idx, question, answers(text)")
      .eq("interview_id", data.interviewId)
      .order("idx", { ascending: true });

    const transcript =
      (prev ?? [])
        .map(
          (p, i) =>
            `Q${i + 1}: ${p.question}\nA${i + 1}: ${(p as { answers?: { text: string }[] }).answers?.[0]?.text ?? "(no answer)"}`,
        )
        .join("\n\n") || "";

    const nextIdx = (prev?.length ?? 1);
    const done = nextIdx >= 6; // 6 questions per session

    if (done) {
      await supabase
        .from("interviews")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", data.interviewId);
      return { score, nextQuestion: null, done: true };
    }

    const { text: nextQ } = await generateText({
      model: gateway()(MODEL),
      system: INTERVIEWER_SYSTEM,
      prompt: `Continuing a ${interview.round} interview for ${interview.level} ${interview.role}.
Transcript so far:
${transcript}

Ask the NEXT question. Make it a natural follow-up that probes a gap or goes deeper. One question only. No preamble.`,
    });

    const { data: q } = await supabase
      .from("questions")
      .insert({
        interview_id: data.interviewId,
        user_id: userId,
        idx: nextIdx,
        question: nextQ,
        category: interview.round,
      })
      .select()
      .single();

    return { score, nextQuestion: q, done: false };
  });

// ---------- Finalize: build report ----------
export const finalizeInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ interviewId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("interview_id", data.interviewId);

    const { data: interview } = await supabase.from("interviews").select("*").eq("id", data.interviewId).single();
    if (!interview) throw new Error("Interview not found");

    const avg = (k: keyof NonNullable<typeof scores>[number]) =>
      scores && scores.length
        ? Math.round(scores.reduce((s, x) => s + (Number(x[k] ?? 0) || 0), 0) / scores.length)
        : 0;

    const rubric = {
      communication: avg("communication"),
      technical: avg("technical"),
      problem_solving: avg("problem_solving"),
      confidence: avg("confidence"),
      clarity: avg("clarity"),
      depth: avg("depth"),
      relevance: avg("relevance"),
      industry: avg("industry"),
      overall: avg("overall"),
    };

    const ReportSchema = z.object({
      summary: z.string(),
      strengths: z.array(z.string()).max(6),
      weaknesses: z.array(z.string()).max(6),
      improvement_plan: z.array(z.string()).max(8),
      hiring_recommendation: z.enum(["strong_hire", "hire", "lean_hire", "no_hire"]),
    });

    const { object: report } = await generateObject({
      model: gateway()(MODEL),
      schema: ReportSchema,
      system: `You are a senior hiring manager writing a candid post-interview report.`,
      prompt: `Role: ${interview.role} (${interview.level}, ${interview.round})
Rubric averages: ${JSON.stringify(rubric)}.
Per-answer feedback: ${JSON.stringify(scores?.map((s) => s.feedback) ?? [])}.
Write the report.`,
    });

    const full = { ...report, rubric };

    await supabase.from("feedback_reports").upsert(
      { interview_id: data.interviewId, user_id: userId, report: full },
      { onConflict: "interview_id" },
    );

    await supabase
      .from("interviews")
      .update({ overall_score: rubric.overall, status: "completed", completed_at: new Date().toISOString() })
      .eq("id", data.interviewId);

    return { report: full };
  });
