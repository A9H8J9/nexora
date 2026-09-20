import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import EmptyState from "./components/EmptyState";
import NewProjectModal from "./components/NewProjectModal";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import TasksPage from "./pages/TasksPage";
import { loadChats, loadProjects, saveChats, saveProjects } from "./storage";
import type { Chat, Message, Project } from "./types";

export type SettingsSection =
  | "general"
  | "appearance"
  | "shortcuts"
  | "hardware"
  | "privacy"
  | "web-search"
  | "attachments"
  | "integrations"
  | "notifications"
  | "data-storage";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createChat(projectId: string | null = null): Chat {
  const now = Date.now();

  return {
    id: createId("chat"),
    title: "New chat",
    projectId,
    messages: [],
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
}

function createProject(
  name: string,
  path: string,
  description: string,
): Project {
  return {
    id: createId("project"),
    name,
    path,
    description,
    createdAt: Date.now(),
    pinned: false,
  };
}

function createMessage(role: Message["role"], content: string): Message {
  return {
    id: createId("message"),
    role,
    content,
    createdAt: Date.now(),
  };
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());

  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const savedChats = loadChats();

    return savedChats[0]?.id ?? null;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("general");

  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  // ============================================================
  // TASKS
  // ============================================================

  const [isTasksOpen, setIsTasksOpen] = useState(false);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // ============================================================
  // CHAT
  // ============================================================

  function handleNewChat() {
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    const chat = createChat(activeProjectId);

    setChats((current) => [chat, ...current]);

    setActiveChatId(chat.id);
  }

  function handleSelectChat(chatId: string) {
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    setActiveChatId(chatId);

    const selectedChat = chats.find((chat) => chat.id === chatId);

    if (selectedChat?.projectId) {
      setActiveProjectId(selectedChat.projectId);
    } else {
      setActiveProjectId(null);
    }
  }

  function handleDeleteChat(chatId: string) {
    const remainingChats = chats.filter((chat) => chat.id !== chatId);

    setChats(remainingChats);

    if (activeChatId === chatId) {
      const nextChat = remainingChats[0];

      setActiveChatId(nextChat?.id ?? null);

      if (nextChat?.projectId) {
        setActiveProjectId(nextChat.projectId);
      } else {
        setActiveProjectId(null);
      }
    }
  }

  function handleRenameChat(chatId: string, title: string) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setChats((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: trimmedTitle,
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );
  }

  function handleToggleChatPin(chatId: string) {
    setChats((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              pinned: !chat.pinned,
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );
  }

  // ============================================================
  // PROJECT
  // ============================================================

  function handleSelectProject(projectId: string) {
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    setActiveProjectId(projectId);

    const projectChat = chats.find((chat) => chat.projectId === projectId);

    if (projectChat) {
      setActiveChatId(projectChat.id);
    } else {
      setActiveChatId(null);
    }
  }

  function handleDeleteProject(projectId: string) {
    const remainingProjects = projects.filter(
      (project) => project.id !== projectId,
    );

    setProjects(remainingProjects);

    setChats((current) =>
      current.map((chat) =>
        chat.projectId === projectId
          ? {
              ...chat,
              projectId: null,
            }
          : chat,
      ),
    );

    if (activeProjectId === projectId) {
      setActiveProjectId(null);

      const nextChat = chats.find((chat) => chat.projectId !== projectId);

      setActiveChatId(nextChat?.id ?? null);
    }
  }

  function handleRenameProject(projectId: string, name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: trimmedName,
            }
          : project,
      ),
    );
  }

  function handleToggleProjectPin(projectId: string) {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              pinned: !project.pinned,
            }
          : project,
      ),
    );
  }

  function handleCreateProject(
    name: string,
    path: string,
    description: string,
  ) {
    const project = createProject(name, path, description);

    setProjects((current) => [project, ...current]);

    setActiveProjectId(project.id);

    setIsProjectModalOpen(false);
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    const chat = createChat(project.id);

    setChats((current) => [chat, ...current]);

    setActiveChatId(chat.id);
  }

  // ============================================================
  // MESSAGES
  // ============================================================

  function handleSendMessage(content: string) {
    if (!activeChat) {
      return;
    }

    const userMessage = createMessage("user", content);

    const updatedChat: Chat = {
      ...activeChat,
      title:
        activeChat.messages.length === 0
          ? content.slice(0, 35) || "New chat"
          : activeChat.title,
      messages: [...activeChat.messages, userMessage],
      updatedAt: Date.now(),
    };

    setChats((current) =>
      current.map((chat) => (chat.id === activeChat.id ? updatedChat : chat)),
    );

    window.setTimeout(() => {
      const assistantMessage = createMessage(
        "assistant",
        "Your message was received. The AI provider and Agent Core will be connected in the next phase.",
      );

      setChats((current) =>
        current.map((chat) => {
          if (chat.id !== activeChat.id) {
            return chat;
          }

          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: Date.now(),
          };
        }),
      );
    }, 500);
  }

  // ============================================================
  // SETTINGS
  // ============================================================

  function handleOpenSettings(section: SettingsSection = "general") {
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    setSettingsSection(section);
    setIsSettingsOpen(true);
  }

  function handleSelectSettingsSection(section: SettingsSection) {
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    setSettingsSection(section);
    setIsSettingsOpen(true);
  }

  function handleCloseSettings() {
    setIsSettingsOpen(false);
  }

  // ============================================================
  // SKILLS
  // ============================================================

  function handleOpenSkills() {
    setIsSettingsOpen(false);
    setIsTasksOpen(false);

    setIsSkillsOpen(true);
  }

  function handleCloseSkills() {
    setIsSkillsOpen(false);
  }

  // ============================================================
  // TASKS
  // ============================================================

  function handleOpenTasks() {
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsProjectModalOpen(false);

    setIsTasksOpen(true);
  }

  function handleCloseTasks() {
    setIsTasksOpen(false);
  }

  // ============================================================
  // PROJECT MODAL
  // ============================================================

  function handleOpenProjectModal() {
    setIsSettingsOpen(false);
    setIsSkillsOpen(false);
    setIsTasksOpen(false);

    setIsProjectModalOpen(true);
  }

  // ============================================================
  // CONTENT
  // ============================================================

  const hasContent = chats.length > 0 || projects.length > 0;

  /*
   * وقتی Skills باز است:
   *
   * - Sidebar توسط SkillsPage مدیریت می‌شود
   * - Settings render نمی‌شود
   * - Skills کل صفحه را می‌گیرد
   */
  if (isSkillsOpen) {
    return <SkillsPage onBack={handleCloseSkills} />;
  }

  /*
   * وقتی Tasks باز است:
   *
   * - TasksPage کل صفحه را می‌گیرد
   * - Sidebar داخل TasksPage مدیریت می‌شود
   * - Chat و Settings render نمی‌شوند
   */
  if (isTasksOpen) {
    return <TasksPage onBack={handleCloseTasks} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0d0f10] text-[#e7e9e8]">
      <Sidebar
        chats={chats}
        projects={projects}
        activeChatId={activeChatId}
        activeProjectId={activeProjectId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onToggleChatPin={handleToggleChatPin}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onToggleProjectPin={handleToggleProjectPin}
        onNewProject={handleOpenProjectModal}
        onOpenSettings={handleOpenSettings}
        isSettingsOpen={isSettingsOpen}
        settingsSection={settingsSection}
        onSelectSettingsSection={handleSelectSettingsSection}
        onCloseSettings={handleCloseSettings}
        isSkillsOpen={isSkillsOpen}
        onOpenSkills={handleOpenSkills}
        onCloseSkills={handleCloseSkills}
        isTasksOpen={isTasksOpen}
        onOpenTasks={handleOpenTasks}
        onCloseTasks={handleCloseTasks}
      />

      {isSettingsOpen ? (
        <SettingsPage section={settingsSection} onBack={handleCloseSettings} />
      ) : hasContent ? (
        <ChatView
          chat={activeChat}
          projectName={activeProject?.name ?? null}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <main className="flex min-w-0 flex-1">
          <EmptyState
            onNewChat={handleNewChat}
            onNewProject={handleOpenProjectModal}
          />
        </main>
      )}

      {isProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
