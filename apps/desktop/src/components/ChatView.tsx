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
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#3b342b] bg-[#211e1a] text-[#c8a96b]">
          <Bot size={15} />
        </div>
      )}

      <div
        className={`max-w-[75%] ${
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
        }`}
      >
        <div className="mb-1.5 px-1 text-[10px] font-medium tracking-wide text-[#766d61]">
          {isUser ? "You" : "Nexora"}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-6 ${
            isUser
              ? "rounded-br-md bg-[#c8a96b] text-[#1a1816]"
              : "rounded-bl-md border border-[#332e28] bg-[#211e1a] text-[#ddd5c8]"
          }`}
        >
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#3b342b] bg-[#211e1a] text-[#a99f91]">
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
      <main className="flex min-w-0 flex-1 items-center justify-center bg-[#181614]">
        <div className="flex max-w-md flex-col items-center px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3b342b] bg-[#211e1a] text-[#c8a96b] shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
            <Sparkles size={25} strokeWidth={1.7} />
          </div>

          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[#eee8dc]">
            Welcome to Nexora
          </h1>

          <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#827a6f]">
            Start a new conversation or select an existing chat from the
            sidebar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#181614]">
      {/* Chat Header */}
      <header className="flex h-[68px] min-h-[68px] items-center justify-between border-b border-[#302a23] bg-[#1a1816] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#493e2e] bg-[#211e1a] text-[#c8a96b]">
            <Sparkles size={16} strokeWidth={1.8} />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#eee8dc]">
                {chat.title}
              </h2>

              <ChevronDown size={13} className="shrink-0 text-[#6f685d]" />
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-[10px]">
              {projectName && (
                <>
                  <span className="max-w-[180px] truncate text-[#b6a17d]">
                    {projectName}
                  </span>

                  <span className="text-[#514a41]">/</span>
                </>
              )}

              <span className="text-[#756d62]">Personal workspace</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-lg border border-[#3b342b] bg-[#211e1a] px-2.5 text-[10px] font-medium text-[#aaa092] transition hover:border-[#554832] hover:bg-[#27221c] hover:text-[#ddd0bd]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96b] shadow-[0_0_7px_rgba(200,169,107,0.45)]" />

            <span>Local model</span>

            <ChevronDown size={12} />
          </button>

          <div className="mx-1 h-5 w-px bg-[#373129]" />

          <div className="flex items-center gap-1.5 px-1 text-[10px] text-[#777065]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8f9b7b] shadow-[0_0_6px_rgba(143,155,123,0.35)]" />
            <span>Local</span>
          </div>

          <button
            type="button"
            aria-label="Chat options"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#756d62] transition hover:border hover:border-[#3b342b] hover:bg-[#25211c] hover:text-[#d5c9b7]"
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
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3b342b] bg-[#211e1a] text-[#c8a96b]">
                <Sparkles size={22} strokeWidth={1.7} />
              </div>

              <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-[#eee8dc]">
                What are we building?
              </h1>

              <p className="mt-2 max-w-md text-[13px] leading-6 text-[#827a6f]">
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
            className="overflow-hidden rounded-2xl border border-[#3b342b] bg-[#211e1a] shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition focus-within:border-[#574a37]"
          >
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message Nexora..."
              rows={1}
              className="block min-h-[52px] w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[13px] leading-6 text-[#eee8dc] outline-none placeholder:text-[#655e55]"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#756d62] transition hover:bg-[#2a2621] hover:text-[#c8bca9]"
                >
                  <Paperclip size={16} />
                </button>

                <span className="hidden text-[10px] text-[#5f594f] sm:block">
                  Enter to send · Shift + Enter for new line
                </span>
              </div>

              <button
                type="submit"
                disabled={!message.trim()}
                title="Send message"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8a96b] text-[#191714] transition hover:bg-[#d8bb7e] disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowUp size={17} strokeWidth={2.2} />
              </button>
            </div>
          </form>

          <div className="mt-2 text-center text-[9px] text-[#514b43]">
            Nexora is currently running in local demo mode.
          </div>
        </div>
      </div>
    </main>
  );
}
