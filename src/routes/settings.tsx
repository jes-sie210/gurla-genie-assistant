import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, DISCLAIMER, Disclaimer } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Gurla Genie Assistant" },
      {
        name: "description",
        content:
          "Personalise your Gurla Genie experience: name, working hours, encouragement level and responsible AI information.",
      },
      { property: "og:title", content: "Settings | AI Gurla Genie Assistant" },
      {
        property: "og:description",
        content: "Tune working hours, tone and encouragement for your AI assistant.",
      },
    ],
  }),
  component: SettingsPage;
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [tone, setTone] = useState("Warm & professional");
  const [encouragement, setEncouragement] = useState(true);
  const [breaks, setBreaks] = useState(true);

  return (
    <AppShell title="Settings" subtitle="Make the genie feel like yours">
      <section className="card-genie space-y-5 p-6">
        <h2 className="font-display text-lg font-semibold">Your profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Preferred name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Thandi"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Assistant tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Warm & professional">Warm &amp; professional</SelectItem>
                <SelectItem value="Direct & concise">Direct &amp; concise</SelectItem>
                <SelectItem value="Coaching & reflective">Coaching &amp; reflective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-start">Working day starts</Label>
            <Input
              id="s-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-end">Working day ends</Label>
            <Input id="s-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card-genie space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Preferences</h2>
        {[
          {
            label: "Encouraging messages",
            help: "Tasteful notes of support in plans and replies.",
            value: encouragement,
            set: setEncouragement,
          },
          {
            label: "Build in recovery breaks",
            help: "Schedules include short breaks between deep-focus blocks.",
            value: breaks,
            set: setBreaks,
          },
        ].map((pref) => (
          <div
            key={pref.label}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{pref.label}</p>
              <p className="text-xs text-muted-foreground">{pref.help}</p>
            </div>
            <Switch checked={pref.value} onCheckedChange={pref.set} />
          </div>
        ))}
      </section>

      <section className="card-genie space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold">Responsible AI</h2>
        <p className="text-sm text-muted-foreground">
          Gurla Genie never stores your tasks outside this browser, and it doesn&apos;t make
          decisions for you — it drafts, prioritises and explains so you can decide with
          confidence.
        </p>
        <p className="text-sm text-muted-foreground">{DISCLAIMER}</p>
      </section>

      <Disclaimer />
    </AppShell>
  );
}
