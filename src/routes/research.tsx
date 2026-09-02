import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Lightbulb, Loader2, NotebookPen, ShieldAlert, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Disclaimer } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { runResearch } from "@/lib/genie.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | AI Gurla Genie Assistant" },
      {
        name: "description",
        content:
          "Paste a topic, question or article and get a plain-English summary, key insights and practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant | AI Gurla Genie Assistant" },
      {
        property: "og:description",
        content: "Summaries, key insights and recommendations in seconds.",
      },
    ],
  }),
  component: Research,
});

const EXAMPLES = [
  "How do I build a business case for a promotion?",
  "Summarise the key trends in hybrid work for 2026.",
  "What should I know before negotiating a salary increase?",
];

function Research() {
  const [content, setContent] = useState("");
  const [goal, setGoal] = useState("");
  const researchFn = useServerFn(runResearch);

  const research = useMutation({
    mutationFn: (input: { content: string; goal: string }) => researchFn({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "The genie couldn't analyse that. Please try again."),
  });

  const data = research.data;

  return (
    <AppShell title="Research Assistant" subtitle="Paste it in, get clarity out">
      <section className="card-genie space-y-4 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="goal">What do you need this for? (optional)</Label>
          <Input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Briefing my manager on Monday"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">Topic, question or article</Label>
          <Textarea
            id="content"
            rows={9}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste an article, report extract, or type a question…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setContent(e)}
              className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {e}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            if (content.trim().length < 12) {
              toast.error("Add a bit more detail so the genie can help.");
              return;
            }
            research.mutate({ content: content.trim(), goal: goal.trim() });
          }}
          disabled={research.isPending}
        >
          {research.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Reading and thinking
            </>
          ) : (
            <>
              <Wand2 className="mr-2 size-4" /> Analyse for me
            </>
          )}
        </Button>
      </section>

      {data ? (
        <section className="space-y-4">
          <div className="card-genie bg-gradient-hero p-6">
            <h2 className="font-display text-xl font-semibold">{data.title}</h2>
          </div>

          <div className="card-genie p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <NotebookPen className="size-4 text-primary" /> Summary
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{data.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-genie p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Lightbulb className="size-4 text-gold" /> Key Insights
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {data.keyInsights.map((insight, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-genie p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CheckCircle2 className="size-4 text-lilac" /> Recommendations
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lilac" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card-genie bg-cream/70 p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <ShieldAlert className="size-4 text-primary" /> Verify before you rely on this
            </h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {data.verifyBefore.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <Disclaimer />
    </AppShell>
  );
}
