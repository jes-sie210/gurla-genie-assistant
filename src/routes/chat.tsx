import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell, Disclaimer } from "@/components/AppShell";
import genieLogo from "@/assets/genie-logo.png";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot | AI Gurla Genie Assistant" },
      {
        name: "description",
        content:
          "Chat with a supportive AI assistant about prioritising tasks, planning your week, meetings and workplace communication.",
      },
      { property: "og:title", content: "AI Chatbot | AI Gurla Genie Assistant" },
      {
        property: "og:description",
        content: "Practical, supportive answers to your workday questions.",
      },
    ],
  }),
  component: ChatPage,
});

const EXAMPLE_PROMPTS = [
  "Help me prioritise my tasks today.",
  "Create a schedule for my week.",
  "Summarise this article.",
  "How can I prepare for my meeting?",
];

function ChatPage() {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (error) => toast.error(error.message || "The genie couldn't reply. Please try again."),
  });

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    void sendMessage({ text: value });
    setInput("");
  }

  return (
    <AppShell title="AI Chatbot" subtitle="Your genie is listening">
      <div className="card-genie flex h-[calc(100vh-16rem)] min-h-[28rem] flex-col overflow-hidden">
        <Conversation className="flex-1">
          <ConversationContent className="space-y-4">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-md py-10 text-center">
                <img
                  src={genieLogo}
                  alt="Gurla Genie"
                  loading="lazy"
                  width={816}
                  height={816}
                  className="mx-auto size-20 rounded-2xl bg-cream/80 p-2"
                />
                <h2 className="mt-4 font-display text-xl font-semibold">
                  Ask me anything about your workday
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prioritising, planning, meeting prep, tricky emails — start with an example
                  below.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" ? (
              <Shimmer className="text-sm">Thinking it through…</Shimmer>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border/70 bg-background/70 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                disabled={busy}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>

          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your genie… e.g. How do I prep for a performance review?"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <Disclaimer />
    </AppShell>
  );
}
