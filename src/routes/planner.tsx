import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CalendarClock, Loader2, Sparkle, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Disclaimer } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTasks, type Priority } from "@/hooks/use-tasks";
import { generateSchedule } from "@/lib/genie.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Gurla Genie Assistant" },
      {
        name: "description",
        content:
          "Add tasks with deadlines, durations and priorities, then generate a prioritised daily or weekly schedule with AI.",
      },
      { property: "og:title", content: "AI Task Planner | AI Gurla Genie Assistant" },
      {
        property: "og:description",
        content: "Turn your to-do list into a realistic, prioritised timeline.",
      },
    ],
  }),
  component: Planner,
});

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-blush text-foreground border-primary/40",
  Medium: "bg-accent text-accent-foreground border-lilac/40",
  Low: "bg-cream text-foreground border-gold/50",
};

type PlanRequest = {
  range: "day" | "week";
  workStart: string;
  workEnd: string;
  focusNote: string;
  tasks: {
    title: string;
    deadline: string;
    durationMinutes: number;
    priority: string;
    notes: string;
  }[];
};

function Planner() {
  const { tasks, addTask, removeTask, toggleTask } = useTasks();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("60");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [notes, setNotes] = useState("");

  const [range, setRange] = useState<"day" | "week">("day");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [focusNote, setFocusNote] = useState("");

  const planFn = useServerFn(generateSchedule);
  const plan = useMutation({
    mutationFn: (input: PlanRequest) => planFn({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "The genie couldn't build a schedule. Please try again."),
  });

  const openTasks = tasks.filter((t) => !t.done);

  function handleAdd() {
    if (!title.trim()) {
      toast.error("Give your task a name first.");
      return;
    }
    addTask({
      title: title.trim(),
      deadline,
      durationMinutes: Math.max(5, Number(duration) || 30),
      priority,
      notes: notes.trim(),
    });
    setTitle("");
    setDeadline("");
    setDuration("60");
    setNotes("");
    toast.success("Task added");
  }

  function handleGenerate() {
    if (openTasks.length === 0) {
      toast.error("Add at least one open task.");
      return;
    }
    plan.mutate({
      range,
      workStart,
      workEnd,
      focusNote: focusNote.trim(),
      tasks: openTasks.map((t) => ({
        title: t.title,
        deadline: t.deadline,
        durationMinutes: t.durationMinutes,
        priority: t.priority,
        notes: t.notes,
      })),
    });
  }

  const days = plan.data ? [...new Set(plan.data.blocks.map((b) => b.day))] : [];

  return (
    <AppShell title="Task Planner" subtitle="Add your tasks, get a prioritised plan">
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card-genie space-y-4 p-6 lg:col-span-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Add a task</h2>
            <p className="text-sm text-muted-foreground">
              The genie re-checks your priority against deadlines and effort.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Task</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Draft the client proposal"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Waiting on numbers from finance"
                rows={2}
              />
            </div>
            <Button className="w-full" onClick={handleAdd}>
              Add task
            </Button>
          </div>

          <div className="space-y-3 border-t border-border/70 pt-4">
            <h3 className="font-display text-base font-semibold">Schedule settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Day starts</Label>
                <Input
                  id="start"
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">Day ends</Label>
                <Input
                  id="end"
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Plan for</Label>
              <Select value={range} onValueChange={(v) => setRange(v as "day" | "week")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today (daily plan)</SelectItem>
                  <SelectItem value="week">This week (Mon-Fri)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focus">Anything the genie should know?</Label>
              <Textarea
                id="focus"
                rows={2}
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
                placeholder="Meetings 11:00-12:00, low energy after 15:00"
              />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={plan.isPending}>
              {plan.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Building your plan
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 size-4" /> Generate schedule
                </>
              )}
            </Button>
          </div>
        </section>

        <div className="space-y-6 lg:col-span-3">
          <section className="card-genie p-6">
            <h2 className="font-display text-lg font-semibold">Your tasks</h2>
            <ul className="mt-4 space-y-2">
              {tasks.length === 0 ? (
                <li className="text-sm text-muted-foreground">No tasks yet.</li>
              ) : (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
                  >
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-label="Mark done"
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {task.durationMinutes} min
                        {task.deadline ? ` · due ${task.deadline}` : ""}
                        {task.notes ? ` · ${task.notes}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
                      {task.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete task"
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </section>

          {plan.data ? (
            <section className="space-y-4">
              <div className="card-genie bg-gradient-hero p-6">
                <Sparkle className="size-4 text-gold" />
                <p className="mt-2 font-display text-lg font-semibold">
                  {plan.data.encouragement}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.data.strategy}</p>
              </div>

              {days.map((day) => (
                <div key={day} className="card-genie p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <CalendarClock className="size-4 text-primary" /> {day}
                  </h3>
                  <ol className="mt-4 space-y-3 border-l-2 border-border pl-4">
                    {plan.data!.blocks
                      .filter((b) => b.day === day)
                      .map((block, i) => (
                        <li key={`${day}-${i}`} className="relative">
                          <span className="absolute -left-[1.4rem] top-2 size-3 rounded-full bg-gradient-primary" />
                          <div className="rounded-xl border border-border/70 bg-background p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold">
                                {block.start} – {block.end}
                              </p>
                              <Badge
                                variant="outline"
                                className={PRIORITY_STYLES[block.priority] ?? ""}
                              >
                                {block.priority}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm font-medium">{block.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{block.why}</p>
                          </div>
                        </li>
                      ))}
                  </ol>
                </div>
              ))}

              <div className="card-genie p-6">
                <h3 className="font-display text-base font-semibold">Watch-outs</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {plan.data.watchOuts.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}
