import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, MessageCircleHeart, Search, Sparkle } from "lucide-react";

import { AppShell, Disclaimer } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Gurla Genie Assistant" },
      {
        name: "description",
        content:
          "Your AI workday dashboard: task priorities at a glance, smart scheduling, research summaries and a supportive AI chatbot.",
      },
      { property: "og:title", content: "Dashboard | AI Gurla Genie Assistant" },
      {
        property: "og:description",
        content: "See today's priorities and jump into planning, research or chat.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "AI Task Planner",
    body: "Add tasks with deadlines and durations, then let the genie build a prioritised day or week schedule.",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    body: "Paste a topic, question or article and get a clear summary, key insights and practical recommendations.",
  },
  {
    to: "/chat",
    icon: MessageCircleHeart,
    title: "AI Chatbot",
    body: "Ask anything about prioritising, meetings, emails or difficult workplace conversations.",
  },
] as const;

function Dashboard() {
  const { tasks } = useTasks();
  const open = tasks.filter((t) => !t.done);
  const counts = {
    High: open.filter((t) => t.priority === "High").length,
    Medium: open.filter((t) => t.priority === "Medium").length,
    Low: open.filter((t) => t.priority === "Low").length,
  };
  const focusMinutes = open.reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <AppShell title="Dashboard" subtitle="A calm, confident view of your workday">
      <section className="card-genie overflow-hidden">
        <div className="bg-gradient-hero px-6 py-8 md:px-10 md:py-10">
          <Badge className="bg-card text-foreground shadow-card hover:bg-card">
            <Sparkle className="mr-1 size-3 text-gold" /> Your AI workday assistant
          </Badge>
          <h2 className="mt-4 font-display text-2xl font-semibold md:text-4xl">
            Organised, confident, in control.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Gurla Genie turns your messy to-do list into a realistic schedule, distils long reads
            into clear insights, and talks you through the workday — one focused block at a time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/planner">
                Plan my day <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/chat">Ask the genie</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open tasks", value: open.length, tone: "bg-secondary" },
          { label: "High priority", value: counts.High, tone: "bg-blush" },
          { label: "Medium priority", value: counts.Medium, tone: "bg-accent" },
          {
            label: "Focus time queued",
            value: `${Math.round((focusMinutes / 60) * 10) / 10}h`,
            tone: "bg-cream",
          },
        ].map((stat) => (
          <div key={stat.label} className={`card-genie ${stat.tone} p-5`}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            className="card-genie group p-6 transition-shadow hover:shadow-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              Open <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="card-genie p-6">
        <h3 className="font-display text-lg font-semibold">Today&apos;s top three</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sorted by priority. Everything else can wait — you&apos;ve got this, girl.
        </p>
        <ul className="mt-4 space-y-3">
          {open.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              No open tasks yet. Add a few in the Task Planner.
            </li>
          ) : (
            [...open]
              .sort(
                (a, b) =>
                  ["High", "Medium", "Low"].indexOf(a.priority) -
                  ["High", "Medium", "Low"].indexOf(b.priority),
              )
              .slice(0, 3)
              .map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background px-4 py-3"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.durationMinutes} min
                    <Badge variant="outline">{task.priority}</Badge>
                  </span>
                </li>
              ))
          )}
        </ul>
      </section>

      <Disclaimer />
    </AppShell>
  );
}
