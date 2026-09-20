import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Plus,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Chat, Project } from "../types";
import type { SettingsSection } from "../App";

interface SidebarProps {
  chats: Chat[];
  projects: Project[];

  activeChatId: string | null;
  activeProjectId: string | null;

  onSelectChat: (chatId: string) => void;
  onSelectProject: (projectId: string) => void;

  onNewChat: () => void;
  onNewProject: () => void;

  onDeleteChat: (chatId: string) => void;
  onDeleteProject: (projectId: string) => void;

  onRenameChat?: (chatId: string, title: string) => void;
  onRenameProject?: (projectId: string, name: string) => void;

  onToggleChatPin?: (chatId: string) => void;
  onToggleProjectPin?: (projectId: string) => void;

  onOpenSettings?: (section?: SettingsSection) => void;

  isSettingsOpen?: boolean;
  settingsSection?: SettingsSection;
  onSelectSettingsSection?: (section: SettingsSection) => void;
  onCloseSettings?: () => void;

  isSkillsOpen?: boolean;
  onOpenSkills?: () => void;
  onCloseSkills?: () => void;

  // Tasks
  isTasksOpen?: boolean;
  onOpenTasks?: () => void;
  onCloseTasks?: () => void;
}

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

type DeleteTarget =
  | {
      type: "chat";
      id: string;
      name: string;
    }
  | {
      type: "project";
      id: string;
      name: string;
    };

type RenameTarget =
  | {
      type: "chat";
      id: string;
      name: string;
    }
  | {
      type: "project";
      id: string;
      name: string;
    };

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="my-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-1.5 flex w-full items-center gap-1 px-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#69716d] transition-colors hover:text-[#929b96]"
      >
        {open ? (
          <ChevronDown size={9} strokeWidth={2} />
        ) : (
          <ChevronRight size={9} strokeWidth={2} />
        )}

        <span className="text-xs">{title}</span>
      </button>

      {open && children}
    </section>
  );
}

function FixedSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <div className="mb-1.5 flex items-center px-1.5 text-xs uppercase tracking-[0.18em] text-[#69716d]">
        {title}
      </div>

      {children}
    </section>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 py-1.5 text-[10px] text-[#5f6663]">{children}</div>
  );
}

const settingsItems: Array<{
  id: SettingsSection;
  label: string;
}> = [
  {
    id: "general",
    label: "General",
  },
  {
    id: "appearance",
    label: "Appearance",
  },
  {
    id: "shortcuts",
    label: "Keyboard Shortcuts",
  },
  {
    id: "hardware",
    label: "Hardware",
  },
  {
    id: "privacy",
    label: "Privacy",
  },
  {
    id: "web-search",
    label: "Web Search",
  },
  {
    id: "attachments",
    label: "Attachments",
  },
  {
    id: "integrations",
    label: "Integrations",
  },
  {
    id: "notifications",
    label: "Notifications",
  },
  {
    id: "data-storage",
    label: "Data & Storage",
  },
];

export default function Sidebar({
  chats,
  projects,

  activeChatId,
  activeProjectId,

  onSelectChat,
  onSelectProject,

  onNewChat,
  onNewProject,

  onDeleteChat,
  onDeleteProject,

  onRenameChat,
  onRenameProject,

  onToggleChatPin,
  onToggleProjectPin,

  onOpenSettings,

  isSettingsOpen = false,
  settingsSection = "general",
  onSelectSettingsSection,
  onCloseSettings,

  isSkillsOpen = false,
  onOpenSkills,
  onCloseSkills,

  isTasksOpen = false,
  onOpenTasks,
  onCloseTasks,
}: SidebarProps) {
  const [search, setSearch] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);

  const [renameValue, setRenameValue] = useState("");

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = query
      ? chats.filter((chat) => chat.title.toLowerCase().includes(query))
      : chats;

    return [...result].sort(
      (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
    );
  }, [chats, search]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = query
      ? projects.filter((project) => project.name.toLowerCase().includes(query))
      : projects;

    return [...result].sort(
      (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
    );
  }, [projects, search]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
  };

  const openDeleteChat = (chat: Chat) => {
    setOpenMenu(null);

    setDeleteTarget({
      type: "chat",
      id: chat.id,
      name: chat.title,
    });
  };

  const openDeleteProject = (project: Project) => {
    setOpenMenu(null);

    setDeleteTarget({
      type: "project",
      id: project.id,
      name: project.name,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.type === "chat") {
      onDeleteChat(deleteTarget.id);
    } else {
      onDeleteProject(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  const openRenameChat = (chat: Chat) => {
    setOpenMenu(null);

    setRenameTarget({
      type: "chat",
      id: chat.id,
      name: chat.title,
    });

    setRenameValue(chat.title);
  };

  const openRenameProject = (project: Project) => {
    setOpenMenu(null);

    setRenameTarget({
      type: "project",
      id: project.id,
      name: project.name,
    });

    setRenameValue(project.name);
  };

  const closeRename = () => {
    setRenameTarget(null);
    setRenameValue("");
  };

  const confirmRename = () => {
    if (!renameTarget) {
      return;
    }

    const value = renameValue.trim();

    if (!value) {
      return;
    }

    if (renameTarget.type === "chat") {
      onRenameChat?.(renameTarget.id, value);
    } else {
      onRenameProject?.(renameTarget.id, value);
    }

    closeRename();
  };

  const handleOpenSettings = (section: SettingsSection = "general") => {
    setOpenMenu(null);
    setSearchOpen(false);

    onOpenSettings?.(section);
  };

  const handleOpenSkills = () => {
    setOpenMenu(null);
    setSearchOpen(false);

    onOpenSkills?.();
  };

  const handleOpenTasks = () => {
    setOpenMenu(null);
    setSearchOpen(false);

    onOpenTasks?.();
  };

  const handleBackFromSkills = () => {
    onCloseSkills?.();
  };

  const handleBackFromTasks = () => {
    onCloseTasks?.();
  };

  const handleBackFromSettings = () => {
    onCloseSettings?.();
  };

  return (
    <>
      <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[#262b29] bg-[#0d0f10] text-[#e7e9e8]">
        {/* =====================================================
            BRAND AREA
        ====================================================== */}
        <div className="relative shrink-0 px-3 pb-3 pt-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[118px] overflow-hidden">
            <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-[#91a99a]/[0.045] blur-3xl" />

            <div className="absolute -right-12 top-[-25px] h-32 w-32 rounded-full bg-[#c6a96b]/[0.035] blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.11]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #7b8881 1px, transparent 1px),
                  linear-gradient(to bottom, #7b8881 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
              }}
            />

            <div className="absolute left-[-34px] top-[14px] h-[92px] w-[92px] rounded-full border border-[#87978e]/[0.12]" />

            <div className="absolute right-[-46px] top-[5px] h-[112px] w-[112px] rounded-full border border-[#87978e]/[0.09]" />

            <div className="absolute right-[20px] top-[52px] h-px w-[82px] rotate-[-27deg] bg-[#c6a96b]/[0.13]" />

            <div className="absolute left-[18px] top-[71px] h-px w-[70px] rotate-[18deg] bg-[#87978e]/[0.14]" />

            <span className="absolute left-[31px] top-[24px] h-1 w-1 rounded-full bg-[#a5b8ac]/40" />

            <span className="absolute right-[35px] top-[29px] h-1 w-1 rounded-full bg-[#c6a96b]/35" />

            <span className="absolute right-[68px] top-[76px] h-[3px] w-[3px] rounded-full bg-[#a5b8ac]/35" />
          </div>

          <div className="relative z-10 flex h-[74px] items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-[#68746e]/50" />

                <span className="text-[14px] font-semibold tracking-[0.34em] text-[#e1e5e3]">
                  NEXORA
                </span>

                <span className="h-px w-5 bg-gradient-to-l from-transparent to-[#68746e]/50" />
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#91a99a]/60" />

                <span className="text-[7px] font-medium uppercase tracking-[0.3em] text-[#66706b]">
                  Intelligent Workspace
                </span>

                <span className="h-1 w-1 rounded-full bg-[#c6a96b]/45" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#343c38] to-transparent" />

          {/* =====================================================
              SETTINGS / SKILLS / TASKS HEADER
          ====================================================== */}
          {isSettingsOpen ? (
            <div className="relative mt-1">
              <button
                type="button"
                onClick={handleBackFromSettings}
                className="group flex h-[36px] w-full items-center gap-2 rounded-[8px] px-2 text-[#858e89] transition-colors hover:bg-[#151a18] hover:text-[#c5ccc8]"
              >
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-[#303834] bg-[#171c19] transition-colors group-hover:border-[#48534d]">
                  <ChevronLeft size={13} strokeWidth={1.8} />
                </span>

                <span className="text-[11px]">Back</span>
              </button>
            </div>
          ) : isSkillsOpen ? (
            <div className="relative mt-1">
              <button
                type="button"
                onClick={handleBackFromSkills}
                className="group flex h-[36px] w-full items-center gap-2 rounded-[8px] px-2 text-[#858e89] transition-colors hover:bg-[#151a18] hover:text-[#c5ccc8]"
              >
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-[#303834] bg-[#171c19] transition-colors group-hover:border-[#48534d]">
                  <ChevronLeft size={13} strokeWidth={1.8} />
                </span>

                <span className="text-[11px]">Back</span>
              </button>
            </div>
          ) : isTasksOpen ? (
            <div className="relative mt-1">
              <button
                type="button"
                onClick={handleBackFromTasks}
                className="group flex h-[36px] w-full items-center gap-2 rounded-[8px] px-2 text-[#858e89] transition-colors hover:bg-[#151a18] hover:text-[#c5ccc8]"
              >
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-[#303834] bg-[#171c19] transition-colors group-hover:border-[#48534d]">
                  <ChevronLeft size={13} strokeWidth={1.8} />
                </span>

                <span className="text-[11px]">Back</span>
              </button>
            </div>
          ) : (
            <>
              {/* New conversation */}
              <button
                type="button"
                onClick={onNewChat}
                className="group relative mt-1 flex h-[40px] w-full items-center gap-2.5 overflow-hidden rounded-[10px] border border-[#39433e] bg-[#171c19] px-2.5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.16)] transition-all duration-200 hover:border-[#62746a] hover:bg-[#1b211e] hover:shadow-[0_10px_28px_rgba(0,0,0,0.25)]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-[55%] w-[55%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-[#9bb1a3]/[0.08] to-transparent transition-all duration-500 group-hover:left-[115%]" />

                <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-[#8da696]/0 transition-all duration-200 group-hover:bg-[#8da696]/70" />

                <span className="relative flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] border border-[#66766d]/25 bg-[#202723] text-[#a9b9af] shadow-inner">
                  <SquarePen size={13} strokeWidth={1.7} />

                  <span className="absolute -right-[2px] -top-[2px] h-[4px] w-[4px] rounded-full bg-[#c6a96b]/70 opacity-70" />
                </span>

                <span className="relative flex min-w-0 flex-1">
                  <span className="truncate text-[11px] font-medium text-[#d7dcda]">
                    New conversation
                  </span>
                </span>

                <span className="relative rounded-[5px] border border-[#343d38] bg-[#121614] px-1.5 py-0.5 text-[8px] font-medium text-[#69736e] transition-colors group-hover:border-[#46524c] group-hover:text-[#87938c]">
                  Ctrl K
                </span>
              </button>

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group mt-2 flex h-[32px] w-full items-center gap-2.5 rounded-[8px] px-2.5 text-[#737c77] transition-colors hover:bg-[#141817] hover:text-[#b1b8b4]"
              >
                <Search
                  size={13}
                  strokeWidth={1.7}
                  className="transition-transform duration-200 group-hover:scale-105"
                />

                <span className="flex-1 text-left text-[11px]">Search</span>

                <span className="rounded border border-[#2b312e] px-1.5 py-0.5 text-[8px] text-[#5f6863]">
                  /
                </span>
              </button>
            </>
          )}
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-color:#2d3430_transparent] [scrollbar-width:thin]">
          {/* SETTINGS */}
          {isSettingsOpen ? (
            <div className="mt-4">
              <div className="mb-2 px-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#69716d]">
                Settings
              </div>

              <div className="space-y-0.5">
                {settingsItems.map((item) => {
                  const active = settingsSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectSettingsSection?.(item.id)}
                      className={`flex h-[34px] w-full items-center rounded-[7px] px-2.5 text-left transition-all ${
                        active
                          ? "bg-[#1b221f] text-[#dce3df]"
                          : "text-[#7d8681] hover:bg-[#141817] hover:text-[#bec6c2]"
                      }`}
                    >
                      <span
                        className={`mr-2 h-[4px] w-[4px] rounded-full transition-colors ${
                          active ? "bg-[#91a99a]" : "bg-transparent"
                        }`}
                      />

                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isSkillsOpen ? (
            /* SKILLS */
            <div className="mt-4">
              <div className="mb-2 px-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#69716d]">
                Build
              </div>

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={handleOpenSkills}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] bg-[#1b221f] px-2 text-left text-[#dce3df]"
                >
                  <Sparkles
                    size={15}
                    strokeWidth={1.7}
                    className="text-[#a1b3a8]"
                  />

                  <span className="text-[11px]">Skills</span>
                </button>

                <button
                  type="button"
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[#707975] transition-colors hover:bg-[#141817] hover:text-[#aeb7b2]"
                >
                  <Puzzle size={15} strokeWidth={1.7} />

                  <span className="text-[11px]">Extensions</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenTasks}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[#707975] transition-colors hover:bg-[#141817] hover:text-[#aeb7b2]"
                >
                  <Archive size={15} strokeWidth={1.7} />

                  <span className="text-[11px]">Tasks</span>
                </button>
              </div>
            </div>
          ) : isTasksOpen ? (
            /* TASKS */
            <div className="mt-4">
              <div className="mb-2 px-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#69716d]">
                Build
              </div>

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={handleOpenSkills}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[#707975] transition-colors hover:bg-[#141817] hover:text-[#aeb7b2]"
                >
                  <Sparkles size={15} strokeWidth={1.7} />

                  <span className="text-[11px]">Skills</span>
                </button>

                <button
                  type="button"
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[#707975] transition-colors hover:bg-[#141817] hover:text-[#aeb7b2]"
                >
                  <Puzzle size={15} strokeWidth={1.7} />

                  <span className="text-[11px]">Extensions</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenTasks}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] bg-[#1b221f] px-2 text-left text-[#dce3df]"
                >
                  <Archive
                    size={15}
                    strokeWidth={1.7}
                    className="text-[#a1b3a8]"
                  />

                  <span className="text-[11px]">Tasks</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* CONVERSATIONS */}
              <CollapsibleSection title="Conversations">
                {filteredChats.length === 0 ? (
                  <EmptySection>
                    {search
                      ? "No conversations found."
                      : "No conversations yet."}
                  </EmptySection>
                ) : (
                  <div className="space-y-0.5">
                    {filteredChats.map((chat) => {
                      const active = chat.id === activeChatId;

                      const menuOpen = openMenu === `chat:${chat.id}`;

                      return (
                        <div key={chat.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => onSelectChat(chat.id)}
                            className={`flex h-[35px] w-full items-center gap-2 rounded-[7px] px-2 pr-8 text-left transition-all ${
                              active
                                ? "bg-[#1b221f] text-[#dce3df]"
                                : "text-[#858d89] hover:bg-[#141817] hover:text-[#c0c7c3]"
                            }`}
                          >
                            <MessageSquare
                              size={13}
                              strokeWidth={1.7}
                              className={
                                active
                                  ? "shrink-0 text-[#9fb2a6]"
                                  : "shrink-0 text-[#626b66]"
                              }
                            />

                            <span className="min-w-0 flex-1 truncate text-[11px]">
                              {chat.title}
                            </span>

                            {chat.pinned && (
                              <Pin
                                size={10}
                                strokeWidth={1.8}
                                className="shrink-0 fill-[#c6a96b]/70 text-[#c6a96b]/70"
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenu(menuOpen ? null : `chat:${chat.id}`);
                            }}
                            className={`absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[5px] border border-transparent bg-[#171b19] text-[#727b76] shadow-sm transition-all hover:border-[#39423d] hover:bg-[#232925] hover:text-[#d1d7d4] ${
                              menuOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                            title="Conversation actions"
                          >
                            <MoreHorizontal size={13} strokeWidth={1.8} />
                          </button>

                          {menuOpen && (
                            <div className="absolute right-1 top-[34px] z-40 w-[155px] overflow-hidden rounded-[9px] border border-[#303833] bg-[#171b19] p-1 shadow-[0_14px_35px_rgba(0,0,0,0.5)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);

                                  onToggleChatPin?.(chat.id);
                                }}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b8c0bc] transition-colors hover:bg-[#202622] hover:text-[#e0e5e2]"
                              >
                                <Pin
                                  size={11}
                                  strokeWidth={1.8}
                                  className={
                                    chat.pinned
                                      ? "fill-[#c6a96b] text-[#c6a96b]"
                                      : ""
                                  }
                                />

                                {chat.pinned ? "Unpin" : "Pin"}
                              </button>

                              <div className="my-1 h-px bg-[#282e2b]" />

                              <button
                                type="button"
                                onClick={() => openRenameChat(chat)}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b8c0bc] transition-colors hover:bg-[#202622] hover:text-[#e0e5e2]"
                              >
                                <SquarePen size={11} strokeWidth={1.8} />
                                Rename
                              </button>

                              <div className="my-1 h-px bg-[#282e2b]" />

                              <button
                                type="button"
                                onClick={() => openDeleteChat(chat)}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b79b9b] transition-colors hover:bg-[#281f1f] hover:text-[#d8bebe]"
                              >
                                <Trash2 size={11} strokeWidth={1.8} />
                                Delete conversation
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CollapsibleSection>

              {/* PROJECTS */}
              <CollapsibleSection title="Projects">
                {filteredProjects.length === 0 ? (
                  <EmptySection>
                    {search ? "No projects found." : "No projects yet."}
                  </EmptySection>
                ) : (
                  <div className="space-y-0.5">
                    {filteredProjects.map((project) => {
                      const active = project.id === activeProjectId;

                      const menuOpen = openMenu === `project:${project.id}`;

                      return (
                        <div key={project.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className={`flex h-[35px] w-full items-center gap-2 rounded-[7px] px-2 pr-8 text-left transition-all ${
                              active
                                ? "bg-[#1b221f] text-[#dce3df]"
                                : "text-[#858d89] hover:bg-[#141817] hover:text-[#c0c7c3]"
                            }`}
                          >
                            {active ? (
                              <FolderOpen
                                size={13}
                                strokeWidth={1.7}
                                className="shrink-0 text-[#9fb2a6]"
                              />
                            ) : (
                              <Folder
                                size={13}
                                strokeWidth={1.7}
                                className="shrink-0 text-[#626b66]"
                              />
                            )}

                            <span className="min-w-0 flex-1 truncate text-[11px]">
                              {project.name}
                            </span>

                            {project.pinned && (
                              <Pin
                                size={10}
                                strokeWidth={1.8}
                                className="shrink-0 fill-[#c6a96b]/70 text-[#c6a96b]/70"
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenu(
                                menuOpen ? null : `project:${project.id}`,
                              );
                            }}
                            className={`absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[5px] border border-transparent bg-[#171b19] text-[#727b76] shadow-sm transition-all hover:border-[#39423d] hover:bg-[#232925] hover:text-[#d1d7d4] ${
                              menuOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                            title="Project actions"
                          >
                            <MoreHorizontal size={13} strokeWidth={1.8} />
                          </button>

                          {menuOpen && (
                            <div className="absolute right-1 top-[34px] z-40 w-[150px] overflow-hidden rounded-[9px] border border-[#303833] bg-[#171b19] p-1 shadow-[0_14px_35px_rgba(0,0,0,0.5)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);

                                  onToggleProjectPin?.(project.id);
                                }}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b8c0bc] transition-colors hover:bg-[#202622] hover:text-[#e0e5e2]"
                              >
                                <Pin
                                  size={11}
                                  strokeWidth={1.8}
                                  className={
                                    project.pinned
                                      ? "fill-[#c6a96b] text-[#c6a96b]"
                                      : ""
                                  }
                                />

                                {project.pinned ? "Unpin" : "Pin"}
                              </button>

                              <div className="my-1 h-px bg-[#282e2b]" />

                              <button
                                type="button"
                                onClick={() => openRenameProject(project)}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b8c0bc] transition-colors hover:bg-[#202622] hover:text-[#e0e5e2]"
                              >
                                <SquarePen size={11} strokeWidth={1.8} />
                                Rename
                              </button>

                              <div className="my-1 h-px bg-[#282e2b]" />

                              <button
                                type="button"
                                onClick={() => openDeleteProject(project)}
                                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] text-[#b79b9b] transition-colors hover:bg-[#281f1f] hover:text-[#d8bebe]"
                              >
                                <Trash2 size={11} strokeWidth={1.8} />
                                Delete project
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onNewProject}
                  className="group mt-1 flex h-[31px] w-full items-center gap-2 rounded-[7px] px-2 text-[#6f7874] transition-colors hover:bg-[#141817] hover:text-[#adb5b0]"
                >
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded border border-[#343b37] transition-colors group-hover:border-[#56635c]">
                    <Plus size={10} />
                  </span>

                  <span className="text-[11px]">New project</span>
                </button>
              </CollapsibleSection>

              {/* BUILD */}
              <FixedSection title="Build">
                <div className="space-y-0.5">
                  {/* Skills */}
                  <button
                    type="button"
                    onClick={handleOpenSkills}
                    className="group flex h-[31px] w-full items-center gap-2 rounded-[7px] px-2 text-[#858d89] transition-colors hover:bg-[#141817] hover:text-[#bdc4c1]"
                  >
                    <Sparkles
                      size={15}
                      strokeWidth={1.7}
                      className="text-[#99aaa0] transition-colors group-hover:text-[#aec0b5]"
                    />

                    <span className="text-[13px]">Skills</span>
                  </button>

                  {/* Extensions */}
                  <button
                    type="button"
                    className="group flex h-[31px] w-full items-center gap-2 rounded-[7px] px-2 text-[#858d89] transition-colors hover:bg-[#141817] hover:text-[#bdc4c1]"
                  >
                    <Puzzle
                      size={15}
                      strokeWidth={1.7}
                      className="text-[#858f8a]"
                    />

                    <span className="text-[13px]">Extensions</span>
                  </button>

                  {/* Tasks */}
                  <button
                    type="button"
                    onClick={handleOpenTasks}
                    className="group flex h-[31px] w-full items-center gap-2 rounded-[7px] px-2 text-[#858d89] transition-colors hover:bg-[#141817] hover:text-[#bdc4c1]"
                  >
                    <Archive
                      size={15}
                      strokeWidth={1.7}
                      className="text-[#858f8a] transition-colors group-hover:text-[#9ba8a1]"
                    />

                    <span className="text-[13px]">Tasks</span>
                  </button>
                </div>
              </FixedSection>
            </>
          )}
        </div>

        {/* BOTTOM */}
        {!isSettingsOpen && !isSkillsOpen && !isTasksOpen && (
          <div className="shrink-0 border-t border-[#252a28] px-3 py-2.5">
            <button
              type="button"
              onClick={() => handleOpenSettings("general")}
              className="flex h-[32px] w-full items-center gap-2 rounded-[7px] px-2 text-[#777f7b] transition-colors hover:bg-[#141817] hover:text-[#b6bcb9]"
            >
              <Settings size={15} strokeWidth={1.7} />

              <span className="text-[13px]">Settings</span>
            </button>

            <div className="mt-1 flex items-center gap-2 rounded-[8px] px-2 py-1.5">
              <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-[#39413d] bg-[#171c19]">
                <span className="text-[9px] font-medium text-[#9aa69f]">U</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-medium text-[#b8bfbc]">
                  User
                </div>

                <div className="truncate text-[8px] text-[#626a66]">
                  Local workspace
                </div>
              </div>

              <div className="h-1.5 w-1.5 rounded-full bg-[#81998a] shadow-[0_0_8px_rgba(129,153,138,0.35)]" />
            </div>
          </div>
        )}
      </aside>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#343b37] bg-[#151918] shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
            <div className="flex items-center gap-3 px-4">
              <Search
                size={17}
                strokeWidth={1.7}
                className="shrink-0 text-[#7f8984]"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeSearch();
                  }
                }}
                placeholder="Search conversations and projects..."
                className="h-[58px] min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#e2e6e4] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-[#5e6762]"
              />

              <button
                type="button"
                onClick={closeSearch}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#68716d] transition-colors hover:bg-[#202522] hover:text-[#aeb6b2]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="h-px bg-[#292f2c]" />

            <div className="max-h-[420px] overflow-y-auto p-2 [scrollbar-color:#303633_transparent] [scrollbar-width:thin]">
              {filteredChats.length === 0 && filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#2c332f] bg-[#1a1e1c]">
                    <Search
                      size={16}
                      strokeWidth={1.6}
                      className="text-[#68716d]"
                    />
                  </div>

                  <div className="text-[11px] text-[#9aa19e]">
                    No results found
                  </div>

                  <div className="mt-1 text-[9px] text-[#5d6661]">
                    Try another search term
                  </div>
                </div>
              ) : (
                <>
                  {filteredChats.length > 0 && (
                    <div className="mb-3">
                      <div className="px-2 pb-1.5 pt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#68716d]">
                        Conversations
                      </div>

                      <div className="space-y-0.5">
                        {filteredChats.map((chat) => (
                          <button
                            key={chat.id}
                            type="button"
                            onClick={() => {
                              onSelectChat(chat.id);
                              closeSearch();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#1c211f]"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#303733] bg-[#191e1c]">
                              <MessageSquare
                                size={12}
                                strokeWidth={1.7}
                                className="text-[#89968f]"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium text-[#cdd2d0]">
                                {chat.title}
                              </div>

                              <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-[#626b66]">
                                <span>Conversation</span>

                                {chat.pinned && (
                                  <>
                                    <span>·</span>

                                    <Pin
                                      size={8}
                                      strokeWidth={1.8}
                                      className="fill-[#c6a96b]/70 text-[#c6a96b]/70"
                                    />

                                    <span>Pinned</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div>
                      <div className="px-2 pb-1.5 pt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#68716d]">
                        Projects
                      </div>

                      <div className="space-y-0.5">
                        {filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              onSelectProject(project.id);

                              closeSearch();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#1c211f]"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#303733] bg-[#191e1c]">
                              <Folder
                                size={12}
                                strokeWidth={1.7}
                                className="text-[#89968f]"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium text-[#cdd2d0]">
                                {project.name}
                              </div>

                              <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-[#626b66]">
                                <span>Project</span>

                                {project.pinned && (
                                  <>
                                    <span>·</span>

                                    <Pin
                                      size={8}
                                      strokeWidth={1.8}
                                      className="fill-[#c6a96b]/70 text-[#c6a96b]/70"
                                    />

                                    <span>Pinned</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#292f2c] px-4 py-2.5">
              <span className="text-[8px] text-[#5f6863]">
                Search across your workspace
              </span>

              <div className="flex items-center gap-1 text-[8px] text-[#5f6863]">
                <span className="rounded border border-[#303733] px-1.5 py-0.5">
                  ESC
                </span>

                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="w-full max-w-[390px] rounded-2xl border border-[#343b37] bg-[#151918] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[#533b3b] bg-[#241b1b] text-[#c39494]">
                <Trash2 size={16} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-[#e0e5e2]">
                  {deleteTarget.type === "chat"
                    ? "Delete conversation?"
                    : "Delete project?"}
                </h3>

                <p className="mt-1.5 text-[10px] leading-5 text-[#737c77]">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-[#aeb6b2]">
                    "{deleteTarget.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-8 rounded-[7px] border border-[#303733] bg-[#191e1c] px-3 text-[9px] font-medium text-[#929b96] transition-colors hover:bg-[#202522] hover:text-[#c4cbc7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="h-8 rounded-[7px] border border-[#634747] bg-[#392525] px-3 text-[9px] font-medium text-[#d6b1b1] transition-colors hover:bg-[#472b2b] hover:text-[#e4c2c2]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRename();
            }
          }}
        >
          <div className="w-full max-w-[390px] rounded-2xl border border-[#343b37] bg-[#151918] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-[#e0e5e2]">
                Rename{" "}
                {renameTarget.type === "chat" ? "conversation" : "project"}
              </h3>

              <p className="mt-1.5 text-[10px] leading-5 text-[#737c77]">
                Choose a new name for this{" "}
                {renameTarget.type === "chat" ? "conversation" : "project"}.
              </p>
            </div>

            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeRename();
                }

                if (event.key === "Enter") {
                  event.preventDefault();
                  confirmRename();
                }
              }}
              className="h-9 w-full rounded-[7px] border border-[#303833] bg-[#101312] px-3 text-[10px] text-[#dce2df] outline-none placeholder:text-[#59625e] focus:border-[#55645b] focus:ring-1 focus:ring-[#55645b]/30"
              placeholder={
                renameTarget.type === "chat"
                  ? "Conversation name..."
                  : "Project name..."
              }
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRename}
                className="h-8 rounded-[7px] border border-[#303733] bg-[#191e1c] px-3 text-[9px] font-medium text-[#929b96] transition-colors hover:bg-[#202522] hover:text-[#c4cbc7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRename}
                disabled={!renameValue.trim()}
                className="h-8 rounded-[7px] border border-[#4d5e54] bg-[#27332d] px-3 text-[9px] font-medium text-[#b8c8be] transition-colors hover:bg-[#304037] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
  