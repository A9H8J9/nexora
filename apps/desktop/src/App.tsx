import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import EmptyState from "./components/EmptyState";
import NewProjectModal from "./components/NewProjectModal";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import TasksPage from "./pages/TasksPage";
import ExtensionsPage from "./pages/ExtensionsPage";
import { loadChats, loadProjects, saveChats, saveProjects } from "./storage";
import type { Chat, Message, Project } from "./types";
import TitleBar from "./components/TitleBar";

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

export type ActivePage =
  | "chat"
  | "settings"
  | "skills"
  | "extensions"
  | "tasks";

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

  // ============================================================
  // ACTIVE PAGE
  // ============================================================

  const [activePage, setActivePage] = useState<ActivePage>("chat");

  // ============================================================
  // SETTINGS
  // ============================================================

  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("general");

  // ============================================================
  // ACTIVE DATA
  // ============================================================

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  // ============================================================
  // STORAGE
  // ============================================================

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
    setActivePage("chat");

    const chat = createChat(activeProjectId);

    setChats((current) => [chat, ...current]);

    setActiveChatId(chat.id);
  }

  function handleSelectChat(chatId: string) {
    setActivePage("chat");

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
    setActivePage("chat");

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
    setActivePage("chat");

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
    setSettingsSection(section);
    setActivePage("settings");
    setIsProjectModalOpen(false);
  }

  function handleSelectSettingsSection(section: SettingsSection) {
    setSettingsSection(section);
    setActivePage("settings");
  }

  // ============================================================
  // SKILLS
  // ============================================================

  function handleOpenSkills() {
    setActivePage("skills");
    setIsProjectModalOpen(false);
  }

  // ============================================================
  // EXTENSIONS
  // ============================================================

  function handleOpenExtensions() {
    setActivePage("extensions");
    setIsProjectModalOpen(false);
  }

  // ============================================================
  // TASKS
  // ============================================================

  function handleOpenTasks() {
    setActivePage("tasks");
    setIsProjectModalOpen(false);
  }

  // ============================================================
  // PROJECT MODAL
  // ============================================================

  function handleOpenProjectModal() {
    setActivePage("chat");
    setIsProjectModalOpen(true);
  }

  // ============================================================
  // CONTENT
  // ============================================================

  const hasContent = chats.length > 0 || projects.length > 0;

  function renderMainContent() {
    if (activePage === "settings") {
      return <SettingsPage section={settingsSection} />;
    }

    if (activePage === "skills") {
      return <SkillsPage />;
    }

    if (activePage === "tasks") {
      return <TasksPage />;
    }

    if (activePage === "extensions") {
      return <ExtensionsPage />;
    }

    if (hasContent) {
      return (
        <ChatView
          chat={activeChat}
          projectName={activeProject?.name ?? null}
          onSendMessage={handleSendMessage}
        />
      );
    }

    return (
      <EmptyState
        onNewChat={handleNewChat}
        onNewProject={handleOpenProjectModal}
      />
    );
  }

  // ============================================================
  // APP
  // ============================================================

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#fafafa] text-[#111111]">
      <TitleBar />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar
          chats={chats}
          projects={projects}
          activeChatId={activeChatId}
          activeProjectId={activeProjectId}
          activePage={activePage}
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
          onSelectSettingsSection={handleSelectSettingsSection}
          onOpenSkills={handleOpenSkills}
          onOpenExtensions={handleOpenExtensions}
          onOpenTasks={handleOpenTasks}
        />

        <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>

      {isProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
