import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/roadmap")({
  component: () => (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Roadmap</p>
      <h1 className="mt-1 font-display text-4xl">7 / 30 / 90-day study plan</h1>
      <p className="mt-4 text-muted-foreground">
        Once you've completed an interview, this page will generate a personalized plan with topics, projects,
        courses, and mock-interview cadence. Coming in the next module.
      </p>
    </div>
  ),
});
