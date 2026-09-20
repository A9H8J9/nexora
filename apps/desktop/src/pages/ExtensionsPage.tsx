import { useMemo, useState } from "react";
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
} from "lucide-react";

type ExtensionStatus = "enabled" | "disabled";

type Extension = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  icon: React.ReactNode;
  status: ExtensionStatus;
  permissions: string[];
};

const extensions: Extension[] = [
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

export default function Extensions() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(extensions.map((extension) => extension.category))),
    ];
  }, []);

  const filteredExtensions = useMemo(() => {
    return extensions.filter((extension) => {
      const matchesQuery =
        extension.name.toLowerCase().includes(query.toLowerCase()) ||
        extension.description.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        category === "All" || extension.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="h-full overflow-y-auto bg-[#0d0f10] text-[#e7e9e7]">
      <div className="mx-auto w-full max-w-6xl px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[#91a99a]">
                <Puzzle size={21} />
              </div>

              <div>
                <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
                  Extensions
                </h1>

                <p className="mt-0.5 text-[13px] text-[#7f8582]">
                  Extend Nexora with tools, integrations and new capabilities.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#91a99a]/20 bg-[#91a99a]/10 px-4 text-[13px] font-medium text-[#b9c9bf] transition hover:bg-[#91a99a]/15"
          >
            <Plus size={16} />
            Browse Extensions
          </button>
        </div>

        {/* Search / Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#686f6b]"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search extensions..."
              className="h-10 w-full rounded-lg border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-[13px] text-[#dfe3df] outline-none placeholder:text-[#606662] transition focus:border-[#91a99a]/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] transition ${
                  category === item
                    ? "bg-white/[0.08] text-[#dfe5e0]"
                    : "text-[#727873] hover:bg-white/[0.04] hover:text-[#aeb5b0]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Installed Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-medium text-[#d5d9d6]">
              Installed
            </h2>

            <p className="mt-1 text-[12px] text-[#686e6a]">
              {filteredExtensions.length} extensions
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-[12px] text-[#737a76] transition hover:text-[#b3bbb6]"
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
              className="group relative rounded-xl border border-white/[0.065] bg-[#111415] transition hover:border-white/[0.10] hover:bg-[#131718]"
            >
              <div className="flex gap-4 p-4">
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[#91a99a]">
                  {extension.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[14px] font-medium text-[#e0e4e1]">
                          {extension.name}
                        </h3>

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            extension.status === "enabled"
                              ? "bg-[#91a99a]"
                              : "bg-[#5c625f]"
                          }`}
                        />

                        <span className="text-[11px] text-[#626864]">
                          {extension.status === "enabled"
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-3xl text-[12px] leading-5 text-[#7b827e]">
                        {extension.description}
                      </p>
                    </div>

                    {/* Menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === extension.id ? null : extension.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#666d69] opacity-0 transition hover:bg-white/[0.06] hover:text-[#b7bdb9] group-hover:opacity-100"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenu === extension.id && (
                        <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-white/[0.08] bg-[#171a1b] p-1 shadow-2xl">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-[#b4bab6] hover:bg-white/[0.06]"
                          >
                            <Settings2 size={14} />
                            Settings
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-[#b4bab6] hover:bg-white/[0.06]"
                          >
                            <Power size={14} />
                            {extension.status === "enabled"
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <div className="my-1 h-px bg-white/[0.06]" />

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-[#d28f8f] hover:bg-[#d28f8f]/[0.08]"
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
                    <span className="text-[11px] text-[#626965]">
                      v{extension.version}
                    </span>

                    <span className="text-[11px] text-[#626965]">
                      by {extension.author}
                    </span>

                    <span className="h-3 w-px bg-white/[0.08]" />

                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className="text-[#777e79]" />

                      <span className="text-[11px] text-[#777e79]">
                        {extension.permissions.length} permissions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredExtensions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-16 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#666d69]">
                <Puzzle size={20} />
              </div>

              <h3 className="text-[13px] font-medium text-[#aeb4b0]">
                No extensions found
              </h3>

              <p className="mt-1 max-w-sm text-[12px] text-[#626864]">
                Try a different search or browse available extensions.
              </p>
            </div>
          )}
        </div>

        {/* Developer Section */}
        <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.018]">
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[#8c9890]">
              <Sparkles size={18} />
            </div>

            <div className="flex-1">
              <h3 className="text-[13px] font-medium text-[#cdd2cf]">
                Build your own extension
              </h3>

              <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#707772]">
                Extend Nexora with custom tools, commands, integrations and
                capabilities using the Nexora Extension API.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#aab1ad] transition hover:bg-white/[0.06]"
                >
                  Extension API
                </button>

                <button
                  type="button"
                  className="rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#aab1ad] transition hover:bg-white/[0.06]"
                >
                  Load Local Extension
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-5 flex items-center gap-2 text-[11px] text-[#555c58]">
          <Shield size={12} />
          Extensions can request access to files, network, terminal and other
          Nexora capabilities.
        </div>
      </div>
    </div>
  );
}