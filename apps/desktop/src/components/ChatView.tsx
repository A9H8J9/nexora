import {
  ArrowUp,
  Bot,
  ChevronDown,
  MoreHorizontal,
  Paperclip,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import type { Chat, Message } from "../types";

interface ChatViewProps {
  chat: Chat | null;
  projectName: string | null;
  onSendMessage: (content: string) => void;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Bot size={15} />
        </div>
      )}

      <div
        className={`max-w-[75%] ${
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
        }`}
      >
        <div className="mb-1.5 px-1 text-[10px] font-medium tracking-wide text-neutral-400">
          {isUser ? "You" : "Nexora"}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-6 ${
            isUser
              ? "rounded-br-md bg-black text-white"
              : "rounded-bl-md border border-neutral-200 bg-white text-[#111111]"
          }`}
        >
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500">
          <User size={15} />
        </div>
      )}
    </div>
  );
}

export default function ChatView({
  chat,
  projectName,
  onSendMessage,
}: ChatViewProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = message.trim();

    if (!content) {
      return;
    }

    onSendMessage(content);
    setMessage("");
  }

  if (!chat) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center bg-[#fafafa]">
        <div className="flex max-w-md flex-col items-center px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Sparkles size={25} strokeWidth={1.7} />
          </div>

          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
            Welcome to Nexora
          </h1>

          <p className="mt-2 max-w-sm text-[13px] leading-6 text-neutral-500">
            Start a new conversation or select an existing chat from the
            sidebar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fafafa]">
      {/* Chat Header */}
      <header className="flex h-[72px] min-h-[72px] items-center justify-between border-b border-neutral-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            <Sparkles size={16} strokeWidth={1.8} />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-black">
                {chat.title}
              </h2>

              <ChevronDown size={13} className="shrink-0 text-neutral-400" />
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-[10px]">
              {projectName && (
                <>
                  <span className="max-w-[180px] truncate text-neutral-600">
                    {projectName}
                  </span>

                  <span className="text-neutral-300">/</span>
                </>
              )}

              <span className="text-neutral-400">Personal workspace</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 text-[10px] font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-black" />

            <span>Local model</span>

            <ChevronDown size={12} />
          </button>

          <div className="mx-1 h-5 w-px bg-neutral-200" />

          <div className="flex items-center gap-1.5 px-1 text-[10px] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            <span>Local</span>
          </div>

          <button
            type="button"
            aria-label="Chat options"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {chat.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="flex max-w-lg flex-col items-center text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
                <Sparkles size={22} strokeWidth={1.7} />
              </div>

              <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-black">
                What are we building?
              </h1>

              <p className="mt-2 max-w-md text-[13px] leading-6 text-neutral-500">
                Ask Nexora to help you understand, plan, or create something.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-6 py-8">
            {chat.messages.map((item) => (
              <MessageBubble key={item.id} message={item} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="w-full shrink-0 px-5 pb-5 pt-3">
        <div className="mx-auto w-full max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition focus-within:border-neutral-400"
          >
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message Nexora..."
              rows={1}
              className="block min-h-[52px] w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[13px] leading-6 text-black outline-none placeholder:text-neutral-400"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />

            <div className="flex h-11 items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Attach file"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
                >
                  <Paperclip size={16} />
                </button>

                <span className="hidden text-[10px] text-neutral-400 sm:block">
                  Enter to send · Shift + Enter for new line
                </span>
              </div>

              <button
                type="submit"
                disabled={!message.trim()}
                title="Send message"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowUp size={17} strokeWidth={2.2} />
              </button>
            </div>
          </form>

          <div className="mt-2 text-center text-[9px] text-neutral-400">
            Nexora is currently running in local demo mode.
          </div>
        </div>
      </div>
    </main>
  );
}
