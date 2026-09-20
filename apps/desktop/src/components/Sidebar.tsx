import {
  Archive,
  ChevronDown,
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
import type { SettingsSection, ActivePage } from "../App";

interface SidebarProps {
  chats: Chat[];
  projects: Project[];

  activeChatId: string | null;
  activeProjectId: string | null;
  activePage: ActivePage;

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

  onSelectSettingsSection?: (section: SettingsSection) => void;

  onOpenSkills?: () => void;

  onOpenExtensions?: () => void;

  onOpenTasks?: () => void;
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
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-md
          px-2
          py-1
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-neutral-400
          transition
          hover:text-neutral-700
        "
      >
        <span>{title}</span>

        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {open && <div className="mt-1.5">{children}</div>}
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
    <section className="mt-4">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {title}
      </div>

      <div className="mt-1.5">{children}</div>
    </section>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 py-2 text-[12px] text-neutral-400">
      {children}
    </div>
  );
}

export default function Sidebar({
  chats,
  projects,

  activeChatId,
  activeProjectId,
  activePage,

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
  onOpenSkills,
  onOpenExtensions,
  onOpenTasks,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<DeleteTarget | null>(null);

  const [renameTarget, setRenameTarget] =
    useState<RenameTarget | null>(null);

  const [renameValue, setRenameValue] = useState("");

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...chats]
      .filter((chat) => {
        if (!query) {
          return true;
        }

        return chat.title?.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const aPinned = Boolean(
          (a as Chat & { pinned?: boolean }).pinned,
        );

        const bPinned = Boolean(
          (b as Chat & { pinned?: boolean }).pinned,
        );

        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        return 0;
      });
  }, [chats, search]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...projects]
      .filter((project) => {
        if (!query) {
          return true;
        }

        return project.name?.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const aPinned = Boolean(
          (a as Project & { pinned?: boolean }).pinned,
        );

        const bPinned = Boolean(
          (b as Project & { pinned?: boolean }).pinned,
        );

        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        return 0;
      });
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
      name: chat.title || "Untitled conversation",
    });
  };

  const openDeleteProject = (project: Project) => {
    setOpenMenu(null);

    setDeleteTarget({
      type: "project",
      id: project.id,
      name: project.name || "Untitled project",
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
      name: chat.title || "",
    });

    setRenameValue(chat.title || "");
  };

  const openRenameProject = (project: Project) => {
    setOpenMenu(null);

    setRenameTarget({
      type: "project",
      id: project.id,
      name: project.name || "",
    });

    setRenameValue(project.name || "");
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

  const handleOpenSettings = () => {
    setOpenMenu(null);
    onOpenSettings?.("general");
  };

  const renderBuildNavigation = () => (
    <FixedSection title="Build">
      <div className="space-y-0.5">
        {/* Skills */}
        <button
          type="button"
          onClick={() => {
            setOpenMenu(null);
            onOpenSkills?.();
          }}
          className={[
            "group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12px] transition",
            activePage === "skills"
              ? "border-[#dfe5e1] bg-[#edf1ee] font-semibold text-[#111111]"
              : "border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-black",
          ].join(" ")}
        >
          <Sparkles
            className={[
              "h-4 w-4 shrink-0 transition",
              activePage === "skills"
                ? "text-[#65796c]"
                : "text-neutral-400 group-hover:text-neutral-600",
            ].join(" ")}
          />

          <span className="truncate">Skills</span>

          {activePage === "skills" && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#65796c]" />
          )}
        </button>

        {/* Extensions */}
        <button
          type="button"
          onClick={() => {
            setOpenMenu(null);
            onOpenExtensions?.();
          }}
          className={[
            "group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12px] transition",
            activePage === "extensions"
              ? "border-[#dfe5e1] bg-[#edf1ee] font-semibold text-[#111111]"
              : "border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-black",
          ].join(" ")}
        >
          <Puzzle
            className={[
              "h-4 w-4 shrink-0 transition",
              activePage === "extensions"
                ? "text-[#65796c]"
                : "text-neutral-400 group-hover:text-neutral-600",
            ].join(" ")}
          />

          <span className="truncate">Extensions</span>

          {activePage === "extensions" && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#65796c]" />
          )}
        </button>

        {/* Tasks */}
        <button
          type="button"
          onClick={() => {
            setOpenMenu(null);
            onOpenTasks?.();
          }}
          className={[
            "group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12px] transition",
            activePage === "tasks"
              ? "border-[#dfe5e1] bg-[#edf1ee] font-semibold text-[#111111]"
              : "border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-black",
          ].join(" ")}
        >
          <Archive
            className={[
              "h-4 w-4 shrink-0 transition",
              activePage === "tasks"
                ? "text-[#65796c]"
                : "text-neutral-400 group-hover:text-neutral-600",
            ].join(" ")}
          />

          <span className="truncate">Tasks</span>

          {activePage === "tasks" && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#65796c]" />
          )}
        </button>
      </div>
    </FixedSection>
  );

  return (
    <aside
      className="
        flex
        h-full
        w-[250px]
        shrink-0
        flex-col
        border-r
        border-[#e7e7e7]
        bg-white
        text-[#111111]
      "
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 pt-3">
        {/* Top actions */}
        <div className="px-1 pb-2">
          <button
            type="button"
            onClick={onNewChat}
            className="
              group
              flex
              w-full
              min-w-0
              items-center
              gap-2.5
              rounded-xl
              border
              border-neutral-200
              bg-neutral-50
              px-3
              py-2.5
              text-left
              text-[12px]
              font-medium
              text-neutral-800
              shadow-[0_1px_2px_rgba(0,0,0,0.03)]
              transition-all
              hover:border-neutral-300
              hover:bg-white
              hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]
              active:scale-[0.985]
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#111111]
                text-white
                transition-transform
                duration-200
                group-hover:scale-105
              "
            >
              <SquarePen className="h-3.5 w-3.5" />
            </span>

            <span className="min-w-0 flex-1 truncate">
              New conversation
            </span>

            <Plus
              className="
                h-3.5
                w-3.5
                shrink-0
                text-neutral-400
                transition
                group-hover:text-black
              "
            />
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="
              mt-1
              flex
              w-full
              items-center
              gap-2.5
              rounded-lg
              px-2.5
              py-2
              text-[12px]
              text-neutral-500
              transition
              hover:bg-neutral-50
              hover:text-black
            "
          >
            <Search className="h-4 w-4 shrink-0" />

            <span>Search</span>

            <span
              className="
                ml-auto
                rounded-md
                border
                border-neutral-200
                px-1.5
                py-0.5
                text-[9px]
                text-neutral-400
              "
            >
              /
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {/* Conversations */}
          <CollapsibleSection title="Conversations">
            {filteredChats.length === 0 ? (
              <EmptySection>No conversations yet.</EmptySection>
            ) : (
              <div className="space-y-0.5">
                {filteredChats.map((chat) => {
                  const isActive = activeChatId === chat.id;

                  const pinned = Boolean(
                    (chat as Chat & { pinned?: boolean }).pinned,
                  );

                  const menuKey = `chat:${chat.id}`;

                  return (
                    <div
                      key={chat.id}
                      className="group relative"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectChat(chat.id)}
                        className={[
                          "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 pr-8 text-left text-[12px] transition",
                          isActive
                            ? "border-[#dfe5e1] bg-[#edf1ee] font-medium text-black"
                            : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-black",
                        ].join(" ")}
                      >
                        <MessageSquare
                          className={[
                            "h-3.5 w-3.5 shrink-0",
                            isActive
                              ? "text-[#65796c]"
                              : "text-neutral-400",
                          ].join(" ")}
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {chat.title || "Untitled conversation"}
                        </span>

                        {pinned && (
                          <Pin className="h-3 w-3 shrink-0 fill-current text-neutral-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        aria-label="Conversation actions"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenu((current) =>
                            current === menuKey ? null : menuKey,
                          );
                        }}
                        className={[
                          "absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition",
                          openMenu === menuKey
                            ? "bg-neutral-200 text-black"
                            : "opacity-0 group-hover:opacity-100 hover:bg-neutral-200 hover:text-black",
                        ].join(" ")}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>

                      {openMenu === menuKey && (
                        <div
                          className="
                            absolute
                            right-1
                            top-[calc(100%-2px)]
                            z-30
                            w-36
                            overflow-hidden
                            rounded-xl
                            border
                            border-neutral-200
                            bg-white
                            p-1
                            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                          "
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onToggleChatPin?.(chat.id);
                              setOpenMenu(null);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-neutral-600
                              transition
                              hover:bg-neutral-50
                              hover:text-black
                            "
                          >
                            <Pin className="h-3.5 w-3.5" />

                            <span>
                              {pinned ? "Unpin" : "Pin"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openRenameChat(chat)}
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-neutral-600
                              transition
                              hover:bg-neutral-50
                              hover:text-black
                            "
                          >
                            <SquarePen className="h-3.5 w-3.5" />

                            <span>Rename</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteChat(chat)}
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-red-500
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                            "
                          >
                            <Trash2 className="h-3.5 w-3.5" />

                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* Projects */}
          <CollapsibleSection title="Projects">
            {filteredProjects.length === 0 ? (
              <div>
                <EmptySection>No projects yet.</EmptySection>

                <button
                  type="button"
                  onClick={onNewProject}
                  className="
                    mt-1
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-2.5
                    py-2
                    text-[12px]
                    text-neutral-500
                    transition
                    hover:bg-neutral-50
                    hover:text-black
                  "
                >
                  <Plus className="h-3.5 w-3.5" />

                  <span>New project</span>
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredProjects.map((project) => {
                  const isActive =
                    activeProjectId === project.id;

                  const pinned = Boolean(
                    (
                      project as Project & {
                        pinned?: boolean;
                      }
                    ).pinned,
                  );

                  const menuKey = `project:${project.id}`;

                  return (
                    <div
                      key={project.id}
                      className="group relative"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onSelectProject(project.id)
                        }
                        className={[
                          "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 pr-8 text-left text-[12px] transition",
                          isActive
                            ? "border-[#dfe5e1] bg-[#edf1ee] font-medium text-black"
                            : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-black",
                        ].join(" ")}
                      >
                        {isActive ? (
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#65796c]" />
                        ) : (
                          <Folder className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        )}

                        <span className="min-w-0 flex-1 truncate">
                          {project.name || "Untitled project"}
                        </span>

                        {pinned && (
                          <Pin className="h-3 w-3 shrink-0 fill-current text-neutral-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        aria-label="Project actions"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenu((current) =>
                            current === menuKey ? null : menuKey,
                          );
                        }}
                        className={[
                          "absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition",
                          openMenu === menuKey
                            ? "bg-neutral-200 text-black"
                            : "opacity-0 group-hover:opacity-100 hover:bg-neutral-200 hover:text-black",
                        ].join(" ")}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>

                      {openMenu === menuKey && (
                        <div
                          className="
                            absolute
                            right-1
                            top-[calc(100%-2px)]
                            z-30
                            w-36
                            overflow-hidden
                            rounded-xl
                            border
                            border-neutral-200
                            bg-white
                            p-1
                            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                          "
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onToggleProjectPin?.(
                                project.id,
                              );
                              setOpenMenu(null);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-neutral-600
                              transition
                              hover:bg-neutral-50
                              hover:text-black
                            "
                          >
                            <Pin className="h-3.5 w-3.5" />

                            <span>
                              {pinned ? "Unpin" : "Pin"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openRenameProject(project)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-neutral-600
                              transition
                              hover:bg-neutral-50
                              hover:text-black
                            "
                          >
                            <SquarePen className="h-3.5 w-3.5" />

                            <span>Rename</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteProject(project)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              rounded-lg
                              px-2.5
                              py-2
                              text-left
                              text-[11px]
                              text-red-500
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                            "
                          >
                            <Trash2 className="h-3.5 w-3.5" />

                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={onNewProject}
                  className="
                    mt-1
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-2.5
                    py-2
                    text-[12px]
                    text-neutral-500
                    transition
                    hover:bg-neutral-50
                    hover:text-black
                  "
                >
                  <Plus className="h-3.5 w-3.5" />

                  <span>New project</span>
                </button>
              </div>
            )}
          </CollapsibleSection>

          {/* Build */}
          {renderBuildNavigation()}
        </div>

        {/* Bottom Settings */}
        <div className="mt-3 border-t border-neutral-100 pt-2 pb-2">
          <button
            type="button"
            onClick={handleOpenSettings}
            className={[
              "group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left text-[12px] transition",
              activePage === "settings"
                ? "border-[#dfe5e1] bg-[#edf1ee] font-semibold text-[#111111]"
                : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-black",
            ].join(" ")}
          >
            <Settings
              className={[
                "h-4 w-4 shrink-0 transition",
                activePage === "settings"
                  ? "text-[#65796c]"
                  : "text-neutral-400 group-hover:text-neutral-600",
              ].join(" ")}
            />

            <span>Settings</span>

            {activePage === "settings" && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#65796c]" />
            )}
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/20
            backdrop-blur-[2px]
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div
            className="
              w-[520px]
              max-w-[calc(100vw-32px)]
              overflow-hidden
              rounded-2xl
              border
              border-neutral-200
              bg-white
              shadow-[0_20px_70px_rgba(0,0,0,0.16)]
            "
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeSearch();
                  }
                }}
                placeholder="Search conversations and projects..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[13px]
                  text-black
                  outline-none
                  placeholder:text-neutral-400
                "
              />

              <button
                type="button"
                onClick={closeSearch}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  text-neutral-400
                  transition
                  hover:bg-neutral-100
                  hover:text-black
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto border-t border-neutral-100 p-2">
              {filteredChats.length === 0 &&
              filteredProjects.length === 0 ? (
                <div className="px-3 py-8 text-center text-[12px] text-neutral-400">
                  No results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <button
                      key={`search-chat-${chat.id}`}
                      type="button"
                      onClick={() => {
                        onSelectChat(chat.id);
                        closeSearch();
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-left
                        transition
                        hover:bg-neutral-50
                      "
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-neutral-400" />

                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium text-neutral-800">
                          {chat.title ||
                            "Untitled conversation"}
                        </div>

                        <div className="text-[10px] text-neutral-400">
                          Conversation
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredProjects.map((project) => (
                    <button
                      key={`search-project-${project.id}`}
                      type="button"
                      onClick={() => {
                        onSelectProject(project.id);
                        closeSearch();
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-left
                        transition
                        hover:bg-neutral-50
                      "
                    >
                      <Folder className="h-4 w-4 shrink-0 text-neutral-400" />

                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium text-neutral-800">
                          {project.name ||
                            "Untitled project"}
                        </div>

                        <div className="text-[10px] text-neutral-400">
                          Project
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/20
            backdrop-blur-[2px]
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="
              w-[400px]
              max-w-[calc(100vw-32px)]
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-5
              shadow-[0_20px_70px_rgba(0,0,0,0.16)]
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Trash2 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-black">
                  Delete{" "}
                  {deleteTarget.type === "chat"
                    ? "conversation"
                    : "project"}
                  ?
                </h3>

                <p className="mt-1.5 text-[12px] leading-5 text-neutral-500">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-neutral-700">
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
                className="
                  rounded-lg
                  border
                  border-neutral-200
                  px-3.5
                  py-2
                  text-[11px]
                  font-medium
                  text-neutral-600
                  transition
                  hover:bg-neutral-50
                  hover:text-black
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="
                  rounded-lg
                  bg-black
                  px-3.5
                  py-2
                  text-[11px]
                  font-medium
                  text-white
                  transition
                  hover:bg-neutral-800
                "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/20
            backdrop-blur-[2px]
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRename();
            }
          }}
        >
          <div
            className="
              w-[400px]
              max-w-[calc(100vw-32px)]
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-5
              shadow-[0_20px_70px_rgba(0,0,0,0.16)]
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <SquarePen className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-semibold text-black">
                  Rename{" "}
                  {renameTarget.type === "chat"
                    ? "conversation"
                    : "project"}
                </h3>

                <p className="mt-1.5 text-[12px] text-neutral-500">
                  Enter a new name.
                </p>
              </div>
            </div>

            <input
              autoFocus
              value={renameValue}
              onChange={(event) =>
                setRenameValue(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmRename();
                }

                if (event.key === "Escape") {
                  closeRename();
                }
              }}
              className="
                mt-4
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-white
                px-3
                py-2.5
                text-[12px]
                text-black
                outline-none
                transition
                placeholder:text-neutral-400
                focus:border-neutral-400
              "
              placeholder="Enter name..."
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRename}
                className="
                  rounded-lg
                  border
                  border-neutral-200
                  px-3.5
                  py-2
                  text-[11px]
                  font-medium
                  text-neutral-600
                  transition
                  hover:bg-neutral-50
                  hover:text-black
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRename}
                disabled={!renameValue.trim()}
                className="
                  rounded-lg
                  bg-black
                  px-3.5
                  py-2
                  text-[11px]
                  font-medium
                  text-white
                  transition
                  hover:bg-neutral-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}