import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { GENIE_SYSTEM_PROMPT, getGenieModel } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        if (!process.env["LOVABLE_API_KEY"]) {
          return new Response("AI is not configured yet.", { status: 500 });
        }

        try {
          const result = streamText({
            model: getGenieModel(),
            system: GENIE_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
