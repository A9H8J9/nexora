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
    <div className="global-empty-state">
      <div className="global-empty-icon">
        <Sparkles size={30} />
      </div>

      <h1>Welcome to Nexora</h1>

      <p>
        Your AI workspace for conversations, projects, and coding workflows.
      </p>

      <div className="empty-actions">
        <button className="primary-button" onClick={onNewChat}>
          <MessageSquarePlus size={17} />
          New chat
        </button>

        <button className="secondary-button" onClick={onNewProject}>
          <FolderPlus size={17} />
          Create project
        </button>
      </div>
    </div>
  );
}
