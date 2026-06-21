import { Link, createFileRoute } from "@tanstack/react-router";
import { Mic, FileText, BarChart3, Sparkles, Quote, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site/nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewPilot AI — Your AI interview coach" },
      {
        name: "description",
        content:
          "Practice realistic technical, behavioral, and HR interviews with an AI recruiter. Voice conversations, instant rubric feedback, ATS resume analysis, and a personalized study plan.",
      },
    ],
  }),
  component: Landing,
});

const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack",
  "AI / ML Engineer",
  "Data Scientist",
  "DevOps",
  "Product Manager",
];

const COMPANIES = ["Google", "Amazon", "Meta", "Microsoft", "OpenAI", "Anthropic", "Netflix"];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="hero mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-paper px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" /> Powered by Lovable AI · GPT-class models
          </div>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            Rehearse the interview <em className="text-terracotta not-italic">before</em> the interview.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            InterviewPilot conducts realistic technical and behavioral interviews with voice, scores every answer on
            eight rubrics, and hands you a study plan that fixes what tripped you up.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/auth">
                Start your first interview <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">
              See how it works →
            </a>
          </div>
        </div>

        {/* hero "transcript card" */}
        <div className="mt-16 grid gap-4 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta" />
                Live · Round 2 / Technical
              </div>
              <span className="text-xs font-medium text-forest">Score 87 / 100</span>
            </div>
            <div className="space-y-4 font-display text-lg">
              <p className="text-muted-foreground">
                <span className="text-xs font-sans uppercase tracking-wider text-terracotta">Recruiter</span>
                <br />
                "Walk me through how you'd design a rate-limiter for a public API serving 50k RPS."
              </p>
              <p>
                <span className="text-xs font-sans uppercase tracking-wider text-forest">You</span>
                <br />
                "I'd start with a token-bucket per client key in Redis, then layer a sliding-window log for burst…"
              </p>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 border-t border-border pt-4 text-xs">
              {[
                ["Technical", 92],
                ["Clarity", 84],
                ["Depth", 88],
                ["Confidence", 81],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="text-muted-foreground">{k}</div>
                  <div className="mt-1 font-display text-xl">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-paper p-6">
              <Mic className="h-5 w-5 text-terracotta" />
              <h3 className="mt-3 font-display text-xl">Speak naturally</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Streaming voice in, voice out. No awkward "type your answer" boxes.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-paper p-6">
              <FileText className="h-5 w-5 text-forest" />
              <h3 className="mt-3 font-display text-xl">Knows your resume</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Questions adapt to your projects, skills, and target role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-y border-border bg-paper/60 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Practice for</p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 font-display text-2xl text-muted-foreground md:text-3xl">
            {ROLES.map((r) => (
              <span key={r} className="hover:text-foreground">{r}</span>
            ))}
          </div>
          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Company-style rounds</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {COMPANIES.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              A whole interview loop, not just a chatbot.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Resume parsing, dynamic question generation, an evaluator that grades on eight rubrics, and a coach that
              builds your 30-day plan — orchestrated as a multi-agent system.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: FileText, t: "Resume + JD analyzer", d: "ATS score, missing keywords, fit gaps." },
              { icon: Mic, t: "Voice interview", d: "Streaming speech-to-text and text-to-speech." },
              { icon: Sparkles, t: "AI evaluation", d: "Communication, technical, clarity, confidence — scored." },
              { icon: BarChart3, t: "Roadmap + analytics", d: "7 / 30 / 90-day plans with topics and projects." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 shrink-0 text-terracotta" />
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t border-border bg-paper/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-4xl md:text-5xl">In four steps.</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Upload your resume", "We parse skills, projects, and gaps."],
              ["02", "Pick role & round", "Frontend, AI, system design — your call."],
              ["03", "Speak the interview", "Real voice. Real follow-ups. Real pressure."],
              ["04", "Read the report", "Scores, strengths, weak spots, study plan."],
            ].map(([n, t, d]) => (
              <li key={n}>
                <div className="font-display text-3xl text-terracotta">{n}</div>
                <div className="mt-2 font-medium">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Quote className="mx-auto h-6 w-6 text-terracotta" />
        <p className="mt-4 font-display text-3xl leading-snug md:text-4xl">
          "Felt eerily close to my actual onsite. The follow-ups don't let you bluff."
        </p>
        <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
          — Software Engineer, anonymized beta tester
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-ink p-12 text-cream md:p-16">
          <h2 className="max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Your next interview should not be the first time you've answered the question.
          </h2>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary" className="rounded-full bg-cream text-ink hover:bg-cream/90">
              <Link to="/auth">Start free — no card</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-terracotta" />
            <span className="font-display text-base text-foreground">InterviewPilot</span>
          </div>
          <p>© {new Date().getFullYear()} InterviewPilot AI. Built with Lovable.</p>
        </div>
      </footer>
    </div>
  );
}
