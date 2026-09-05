import { createServerFn } from "@tanstack/react-start";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

import { GENIE_SYSTEM_PROMPT, getGenieModel } from "./ai-gateway.server";

const TaskInput = z.object({
  title: z.string(),
  deadline: z.string().optional(),
  durationMinutes: z.number(),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

const PlanInput = z.object({
  range: z.enum(["day", "week"]),
  workStart: z.string(),
  workEnd: z.string(),
  focusNote: z.string().optional(),
  tasks: z.array(TaskInput),
});

const PlanSchema = z.object({
  encouragement: z.string(),
  strategy: z.string(),
  blocks: z.array(
    z.object({
      day: z.string(),
      start: z.string(),
      end: z.string(),
      title: z.string(),
      priority: z.string(),
      why: z.string().nullable().default(""),
    }),
  ),
  watchOuts: z.array(z.string()),
});

export type GeniePlan = z.infer<typeof PlanSchema>;

const ResearchSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyInsights: z.array(z.string()),
  recommendations: z.array(z.string()),
  verifyBefore: z.array(z.string()),
});

export type GenieResearch = z.infer<typeof ResearchSchema>;

async function structured<T>(
  schema: z.ZodType<T>,
  prompt: string,
  system: string,
): Promise<T> {
  console.log("[genie] structured() start");
  const result = streamText({
    model: getGenieModel(),
    system,
    prompt,
    output: Output.object({ schema }),
  });
  console.log("[genie] streamText created");

  try {
    const out = (await result.output) as T;
    console.log("[genie] output resolved");
    return out;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const match = error.text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return schema.parse(JSON.parse(match[0]));
        } catch {
          // fall through to the friendly error below
        }
      }
    }
    throw new Error(
      "The genie's answer didn't come back in a usable format. Please try again in a moment.",
    );
  }
}

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const taskList = data.tasks
      .map(
        (t, i) =>
          `${i + 1}. "${t.title}" — est. ${t.durationMinutes} min` +
          (t.deadline ? `, deadline ${t.deadline}` : ", no deadline") +
          (t.priority ? `, user-set priority ${t.priority}` : "") +
          (t.notes ? `, notes: ${t.notes}` : ""),
      )
      .join("\n");

    const prompt = `Build a realistic ${data.range === "day" ? "single-day" : "5-day working week (Monday to Friday)"} schedule.

Working hours: ${data.workStart} to ${data.workEnd}.
${data.focusNote ? `User context: ${data.focusNote}` : ""}

Tasks:
${taskList}

Rules:
- Assign every task a priority of exactly "High", "Medium" or "Low" using deadline urgency, impact and effort. You may override the user's guess if the deadline says otherwise.
- Schedule High priority work in the earliest deep-focus slots.
- Insert short recovery breaks and keep blocks inside working hours.
- Use "day" values like "Today" for a day plan, or "Monday"..."Friday" for a week plan.
- Times in 24h "HH:MM" format.
- "why" is one short sentence of reasoning.
- "encouragement" is one warm, professional sentence of motivation.
- "strategy" is 2-3 sentences describing how the plan is sequenced.
- "watchOuts" lists 2-4 realistic risks or overload warnings.

Return JSON in exactly this shape (every field required, "blocks" is a flat array — one object per time block):
{
  "encouragement": "string",
  "strategy": "string",
  "blocks": [
    { "day": "Today", "start": "09:00", "end": "10:30", "title": "Task title", "priority": "High", "why": "string" }
  ],
  "watchOuts": ["string"]
}`;

    return await structured(PlanSchema, prompt, GENIE_SYSTEM_PROMPT);
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        content: z.string(),
        goal: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const prompt = `Analyse the material below for a busy professional.

${data.goal ? `The user's goal: ${data.goal}` : ""}

Material:
"""
${data.content.slice(0, 20000)}
"""

Produce:
- "title": a short descriptive title (max 8 words).
- "summary": a plain-English summary of about 90-130 words, no jargon.
- "keyInsights": 4-6 specific main points or findings.
- "recommendations": 3-5 practical next actions the user can take at work.
- "verifyBefore": 2-3 things the user should double-check or verify independently.
Never invent facts that are not supported by the material or by well-established general knowledge.`;

    return await structured(ResearchSchema, prompt, GENIE_SYSTEM_PROMPT);
  });
