import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  Puzzle,
  Settings2,
  MoreHorizontal,
  Power,
  Trash2,
  RefreshCw,
  Plus,
  Shield,
  Terminal,
  Globe,
  GitBranch,
  Database,
  Sparkles,
  Package,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

type ExtensionStatus = "enabled" | "disabled";

type Extension = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  icon: ReactNode;
  status: ExtensionStatus;
  permissions: string[];
};

const initialExtensions: Extension[] = [
  {
    id: "github",
    name: "GitHub",
    description:
      "Connect Nexora to GitHub repositories, issues, pull requests and workflows.",
    version: "1.0.0",
    author: "Nexora",
    category: "Development",
    icon: <GitBranch size={22} />,
    status: "enabled",
    permissions: ["Network", "Git", "Project Files"],
  },
  {
    id: "browser",
    name: "Browser",
    description:
      "Give Nexora browser capabilities for web research and browser-based tasks.",
    version: "1.0.0",
    author: "Nexora",
    category: "Tools",
    icon: <Globe size={22} />,
    status: "enabled",
    permissions: ["Network", "Browser"],
  },
  {
    id: "terminal",
    name: "Terminal",
    description:
      "Allow agents to interact with the local terminal and development environment.",
    version: "1.0.0",
    author: "Nexora",
    category: "Development",
    icon: <Terminal size={22} />,
    status: "enabled",
    permissions: ["Terminal", "Project Files"],
  },
  {
    id: "database",
    name: "Database Tools",
    description:
      "Database inspection and development tools for AI-powered workflows.",
    version: "0.9.0",
    author: "Nexora",
    category: "Development",
    icon: <Database size={22} />,
    status: "disabled",
    permissions: ["Network", "Project Files"],
  },
];

type ExtensionsPageProps = {};

export default function ExtensionsPage(_: ExtensionsPageProps = {}) {
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(extensions.map((extension) => extension.category))),
    ];
  }, [extensions]);

  const filteredExtensions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return extensions.filter((extension) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        extension.name.toLowerCase().includes(normalizedQuery) ||
        extension.description.toLowerCase().includes(normalizedQuery) ||
        extension.author.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        category === "All" || extension.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [extensions, query, category]);

  const enabledCount = extensions.filter(
    (extension) => extension.status === "enabled",
  ).length;

  const toggleExtension = (id: string) => {
    setExtensions((current) =>
      current.map((extension) =>
        extension.id === id
          ? {
              ...extension,
              status: extension.status === "enabled" ? "disabled" : "enabled",
            }
          : extension,
      ),
    );

    setActiveMenu(null);
  };

  const uninstallExtension = (id: string) => {
    setExtensions((current) =>
      current.filter((extension) => extension.id !== id),
    );

    setActiveMenu(null);
  };

  const handleBrowseExtensions = () => {
    setActiveMenu(null);

    // UI only for now.
    // Extension marketplace functionality will be added later.
  };

  const handleCheckUpdates = () => {
    setActiveMenu(null);

    // UI only for now.
    // Real update checking will be added later.
  };

  const handleExtensionSettings = () => {
    setActiveMenu(null);

    // UI only for now.
  };

  const handleLoadLocalExtension = () => {
    // UI only for now.
    // Local extension loading will be implemented later.
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[#fafafa] text-[#111111]"
      onClick={() => setActiveMenu(null)}
    >
      <PageHeader
        icon={Puzzle}
        title="Extensions"
        subtitle="Extend Nexora with tools, integrations and new capabilities"
        actions={
          <>
            <div className="hidden h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />

              <span className="text-xs font-medium text-neutral-600">
                {enabledCount} active
              </span>
            </div>

            <button
              type="button"
              onClick={handleBrowseExtensions}
              className="flex h-9 shrink-0 items-center gap-2 rounded-xl bg-black px-3.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98]"
            >
              <Plus size={15} strokeWidth={2} />
              Browse Extensions
            </button>
          </>
        }
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-7">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="text-[11px] text-neutral-500">Installed</div>

              <div className="mt-1 text-[17px] font-medium text-black">
                {extensions.length}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="text-[11px] text-neutral-500">Enabled</div>

              <div className="mt-1 text-[17px] font-medium text-black">
                {enabledCount}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="text-[11px] text-neutral-500">Categories</div>

              <div className="mt-1 text-[17px] font-medium text-black">
                {categories.length - 1}
              </div>
            </div>
          </div>

          {/* Search / Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[380px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search extensions..."
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-[13px] text-black outline-none placeholder:text-neutral-400 transition focus:border-neutral-400"
              />
            </div>

            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] transition ${
                    category === item
                      ? "bg-black font-medium text-white"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Installed Header */}
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-[14px] font-medium text-black">
                Installed
              </h2>

              <p className="mt-1 text-[12px] text-neutral-500">
                {filteredExtensions.length}{" "}
                {filteredExtensions.length === 1 ? "extension" : "extensions"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckUpdates}
              className="flex items-center gap-1.5 text-[12px] text-neutral-500 transition hover:text-black"
            >
              <RefreshCw size={13} />
              Check for updates
            </button>
          </div>

          {/* Extensions */}
          <div className="space-y-2.5">
            {filteredExtensions.map((extension) => (
              <div
                key={extension.id}
                className="group relative rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                      extension.status === "enabled"
                        ? "border-neutral-200 bg-neutral-100 text-black"
                        : "border-neutral-200 bg-neutral-50 text-neutral-400"
                    }`}
                  >
                    {extension.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[14px] font-medium text-black">
                            {extension.name}
                          </h3>

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              extension.status === "enabled"
                                ? "bg-black"
                                : "bg-neutral-300"
                            }`}
                          />

                          <span className="text-[11px] text-neutral-500">
                            {extension.status === "enabled"
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>

                        <p className="mt-1.5 max-w-3xl text-[12px] leading-5 text-neutral-500">
                          {extension.description}
                        </p>
                      </div>

                      {/* Menu */}
                      <div
                        className="relative shrink-0"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === extension.id ? null : extension.id,
                            )
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-black ${
                            activeMenu === extension.id
                              ? "bg-neutral-100 opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {activeMenu === extension.id && (
                          <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                            <button
                              type="button"
                              onClick={handleExtensionSettings}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                            >
                              <Settings2 size={14} />
                              Settings
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExtension(extension.id)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                            >
                              <Power size={14} />

                              {extension.status === "enabled"
                                ? "Disable"
                                : "Enable"}
                            </button>

                            <div className="my-1 h-px bg-neutral-100" />

                            <button
                              type="button"
                              onClick={() => uninstallExtension(extension.id)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-red-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                              Uninstall
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-[11px] text-neutral-400">
                        v{extension.version}
                      </span>

                      <span className="text-[11px] text-neutral-400">
                        by {extension.author}
                      </span>

                      <span className="h-3 w-px bg-neutral-200" />

                      <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600">
                        {extension.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-neutral-400" />

                        <span className="text-[11px] text-neutral-400">
                          {extension.permissions.length} permissions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredExtensions.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                  <Puzzle size={20} />
                </div>

                <h3 className="text-[13px] font-medium text-black">
                  No extensions found
                </h3>

                <p className="mt-1 max-w-sm text-[12px] text-neutral-500">
                  Try a different search or browse available extensions.
                </p>

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mt-4 text-[12px] font-medium text-neutral-600 hover:text-black"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Developer Section */}
          <div className="mt-10 rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                <Sparkles size={18} />
              </div>

              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-black">
                  Build your own extension
                </h3>

                <p className="mt-1 max-w-2xl text-[12px] leading-5 text-neutral-500">
                  Extend Nexora with custom tools, commands, integrations and
                  capabilities using the Nexora Extension API.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
                  >
                    <Package size={13} />
                    Extension API
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadLocalExtension}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
                  >
                    <Plus size={13} />
                    Load Local Extension
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-5 flex items-start gap-2 pb-8 text-[11px] leading-5 text-neutral-400">
            <Shield size={12} className="mt-0.5 shrink-0" />

            <span>
              Extensions can request access to files, network, terminal and
              other Nexora capabilities. Permissions will be managed by Nexora's
              extension system.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
