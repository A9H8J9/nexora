import { FolderPlus, MessageSquarePlus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onNewChat: () => void;
  onNewProject: () => void;
}

export default function EmptyState({
  onNewChat,
  onNewProject,
}: EmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
        <Sparkles size={26} />
      </div>

      <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
        Welcome to Nexora
      </h1>

      <p className="mt-2 max-w-sm text-[13px] leading-6 text-neutral-500">
        Your AI workspace for conversations, projects, and coding workflows.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-[12px] font-medium text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]"
        >
          <MessageSquarePlus size={16} />
          New chat
        </button>

        <button
          type="button"
          onClick={onNewProject}
          className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-[12px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black active:scale-[0.98]"
        >
          <FolderPlus size={16} />
          Create project
        </button>
      </div>
    </div>
  );
}
