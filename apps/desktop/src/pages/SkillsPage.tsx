import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  source: string;
  slug: string;
  installs: number;
  url?: string | null;
}

interface InstalledSkill {
  id: string;
  name: string;
  source: string;
  slug: string;
  path: string;
  enabled: boolean;
}

type SkillLike = Skill | InstalledSkill;

interface Audit {
  provider?: string;
  status?: string;
  riskLevel?: string;
  summary?: string;
}

interface AuditResult {
  id: string;
  source: string;
  slug: string;
  audits: Audit[];
}

interface SkillsPageProps {
  onBack: () => void;
}

function formatInstalls(value: number) {
  if (!value) return "—";

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString();
}

function prettyName(skill: Pick<SkillLike, "name" | "slug">) {
  if (skill.name?.trim()) {
    return skill.name;
  }

  return skill.slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeSkillId(id: string) {
  return id.trim().replace(/^https?:\/\/skills\.sh\//, "");
}

function getSkillKey(id: string) {
  return normalizeSkillId(id);
}

function getRiskClass(risk?: string) {
  const value = risk?.toUpperCase() ?? "";

  if (value === "CRITICAL" || value === "HIGH") {
    return {
      text: "text-[#d49a95]",
      bg: "bg-[#281c1b]",
      border: "border-[#4b302e]",
    };
  }

  if (value === "MEDIUM") {
    return {
      text: "text-[#cdb17a]",
      bg: "bg-[#272217]",
      border: "border-[#4a3c25]",
    };
  }

  return {
    text: "text-[#94b19f]",
    bg: "bg-[#19231e]",
    border: "border-[#304237]",
  };
}

export default function SkillsPage({ onBack }: SkillsPageProps) {
  const [query, setQuery] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);

  const [installed, setInstalled] = useState<InstalledSkill[]>([]);

  const [selected, setSelected] = useState<SkillLike | null>(null);

  const [audit, setAudit] = useState<AuditResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [loadingInstalled, setLoadingInstalled] = useState(false);

  const [loadingAudit, setLoadingAudit] = useState(false);

  const [installing, setInstalling] = useState<string | null>(null);

  const [updating, setUpdating] = useState<string | null>(null);

  const [uninstalling, setUninstalling] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const [view, setView] = useState<"discover" | "installed">("discover");

  const installedIds = useMemo(
    () => new Set(installed.map((item) => getSkillKey(item.id))),
    [installed],
  );

  const installedCount = installed.length;

  const visibleSkills: SkillLike[] = view === "installed" ? installed : skills;

  async function loadInstalled() {
    setLoadingInstalled(true);
    setError(null);

    try {
      const result = await invoke<InstalledSkill[]>("list_installed_skills");

      setInstalled(result);

      setSelected((current) => {
        if (!current) {
          return null;
        }

        const updated = result.find(
          (item) => getSkillKey(item.id) === getSkillKey(current.id),
        );

        return updated ?? current;
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoadingInstalled(false);
    }
  }

  async function searchSkills(value: string) {
    const search = value.trim();

    if (search.length < 2) {
      setSkills([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invoke<Skill[]>("search_skills", {
        query: search,
      });

      setSkills(result);
    } catch (err) {
      setSkills([]);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function inspectAudit(source: string, slug: string) {
    setLoadingAudit(true);
    setAudit(null);

    try {
      const result = await invoke<AuditResult>("audit_skill", {
        source,
        slug,
      });

      setAudit(result);
    } catch (err) {
      console.error(err);

      setAudit({
        id: `${source}/${slug}`,
        source,
        slug,
        audits: [],
      });
    } finally {
      setLoadingAudit(false);
    }
  }

  async function selectSkill(skill: SkillLike) {
    setSelected(skill);
    setNotice(null);
    setError(null);

    await inspectAudit(skill.source, skill.slug);
  }

  /*
   * Creates the local representation of a skill immediately after
   * the backend confirms that installation succeeded.
   *
   * We intentionally don't wait for list_installed_skills here.
   * The CLI can finish the installation before its listing command
   * reflects the new state.
   */
  function createInstalledSkill(skill: SkillLike): InstalledSkill {
    if ("path" in skill && "enabled" in skill) {
      return {
        id: skill.id,
        name: skill.name,
        source: skill.source,
        slug: skill.slug,
        path: skill.path,
        enabled: skill.enabled,
      };
    }

    return {
      id: skill.id,
      name: skill.name,
      source: skill.source,
      slug: skill.slug,
      path: "",
      enabled: true,
    };
  }

  async function installSkill(skill: SkillLike) {
    const key = getSkillKey(skill.id);

    if (installedIds.has(key)) {
      setNotice(`${prettyName(skill)} is already installed.`);
      return;
    }

    setInstalling(key);
    setError(null);
    setNotice(null);

    try {
      await invoke("install_skill", {
        id: skill.id,
      });

      /*
       * IMPORTANT:
       * Update the frontend immediately after the backend succeeds.
       *
       * Do NOT call loadInstalled() here because the CLI's list command
       * may temporarily return the old state.
       */
      const installedSkill = createInstalledSkill(skill);

      setInstalled((current) => {
        const exists = current.some((item) => getSkillKey(item.id) === key);

        if (exists) {
          return current;
        }

        return [...current, installedSkill];
      });

      /*
       * If the selected item is the skill we just installed,
       * convert it into the installed representation immediately.
       */
      setSelected((current) => {
        if (!current) {
          return current;
        }

        if (getSkillKey(current.id) !== key) {
          return current;
        }

        return installedSkill;
      });

      setNotice(`${prettyName(skill)} is now installed in Nexora.`);
    } catch (err) {
      setError(String(err));
    } finally {
      setInstalling(null);
    }
  }

  async function uninstallSkill(skill: SkillLike) {
    const key = getSkillKey(skill.id);

    setUninstalling(key);
    setError(null);
    setNotice(null);

    /*
     * Save the current state so we can restore it if uninstall fails.
     */
    const previousInstalled = installed;

    try {
      await invoke("uninstall_skill", {
        id: skill.id,
      });

      /*
       * IMPORTANT:
       * Remove it immediately from the frontend.
       *
       * This makes:
       * - Installed badge disappear
       * - Install button appear
       * - Installed count decrease
       * - Installed tab update
       * immediately.
       */
      setInstalled((current) =>
        current.filter((item) => getSkillKey(item.id) !== key),
      );

      /*
       * Close the detail panel if the removed skill was selected.
       */
      setSelected((current) => {
        if (!current) {
          return current;
        }

        return getSkillKey(current.id) === key ? null : current;
      });

      setAudit((current) => {
        if (!current) {
          return current;
        }

        return getSkillKey(current.id) === key ? null : current;
      });

      setNotice(`${prettyName(skill)} was removed from Nexora.`);
    } catch (err) {
      /*
       * Backend uninstall failed, so restore the previous UI state.
       */
      setInstalled(previousInstalled);
      setError(String(err));
    } finally {
      setUninstalling(null);
    }
  }

  async function updateSkill(skill: SkillLike) {
    const key = getSkillKey(skill.id);

    setUpdating(key);
    setError(null);
    setNotice(null);

    try {
      await invoke("update_skill", {
        id: skill.id,
      });

      /*
       * Updating does not change the installed/uninstalled state,
       * so there is no need to replace the local state with
       * list_installed_skills immediately.
       */
      setNotice(`${prettyName(skill)} was updated.`);
    } catch (err) {
      setError(String(err));
    } finally {
      setUpdating(null);
    }
  }

  async function openSkillPage(skill: SkillLike) {
    try {
      await invoke("open_skill_page", {
        id: skill.id,
      });
    } catch (err) {
      setError(String(err));
    }
  }

  function changeView(nextView: "discover" | "installed") {
    setView(nextView);

    setSelected(null);
    setAudit(null);
    setError(null);
    setNotice(null);

    if (nextView === "installed") {
      setQuery("");
      setSkills([]);
    }
  }

  useEffect(() => {
    loadInstalled();
  }, []);

  useEffect(() => {
    if (view !== "discover") {
      return;
    }

    const timer = window.setTimeout(() => {
      searchSkills(query);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, view]);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#0d0f10] text-[#e7e9e8]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="flex h-[64px] shrink-0 items-center border-b border-[#252a28] bg-[#101312] px-5">
        <button
          type="button"
          onClick={onBack}
          className="mr-3 flex h-8 w-8 items-center justify-center rounded-[7px] text-[#737c77] transition hover:bg-[#1a1f1d] hover:text-[#dce1de]"
        >
          <ArrowLeft size={17} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#303733] bg-[#171b19]">
            <Sparkles size={16} className="text-[#9bb3a3]" />
          </div>

          <div>
            <div className="text-[14px] font-semibold tracking-[-0.01em]">
              Skills
            </div>

            <div className="text-[10px] text-[#626b66]">
              Extend Nexora with new capabilities
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-[7px] border border-[#292f2c] bg-[#151918] px-3 py-1.5 text-[10px] text-[#747d78] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7fa18b]" />
            {installedCount} installed
          </div>

          <button
            type="button"
            onClick={loadInstalled}
            disabled={loadingInstalled}
            title="Refresh installed skills"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#292f2c] bg-[#151918] text-[#747d78] transition hover:bg-[#1b201e] hover:text-[#c0c7c3] disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loadingInstalled ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={() => window.open("https://skills.sh", "_blank")}
            className="hidden h-8 items-center gap-1.5 rounded-[7px] border border-[#292f2c] bg-[#151918] px-3 text-[11px] text-[#747d78] transition hover:bg-[#1b201e] hover:text-[#c0c7c3] sm:flex"
          >
            skills.sh
            <ExternalLink size={11} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1050px] px-5 py-7 sm:px-8">
            {/* =================================================
                HERO
            ================================================== */}

            <div className="mb-7">
              <h1 className="text-[21px] font-semibold tracking-[-0.025em] text-[#e2e6e4]">
                {view === "installed" ? "Your skills" : "Discover skills"}
              </h1>

              <p className="mt-1.5 text-[12px] leading-5 text-[#69716d]">
                {view === "installed"
                  ? "Skills currently available to Nexora."
                  : "Find reusable capabilities for coding, research, development, and more."}
              </p>
            </div>

            {/* =================================================
                TABS
            ================================================== */}

            <div className="mb-5 flex items-center gap-1 rounded-[8px] border border-[#252b28] bg-[#121615] p-1">
              <button
                type="button"
                onClick={() => changeView("discover")}
                className={`flex h-8 flex-1 items-center justify-center gap-2 rounded-[6px] text-[11px] transition sm:flex-none sm:px-5 ${
                  view === "discover"
                    ? "bg-[#202722] text-[#d8dfdb] shadow-sm"
                    : "text-[#69726d] hover:text-[#aeb6b2]"
                }`}
              >
                <Search size={13} />
                Discover
              </button>

              <button
                type="button"
                onClick={() => changeView("installed")}
                className={`flex h-8 flex-1 items-center justify-center gap-2 rounded-[6px] text-[11px] transition sm:flex-none sm:px-5 ${
                  view === "installed"
                    ? "bg-[#202722] text-[#d8dfdb] shadow-sm"
                    : "text-[#69726d] hover:text-[#aeb6b2]"
                }`}
              >
                <Package size={13} />
                Installed
                {installedCount > 0 && (
                  <span className="rounded-full bg-[#2b342f] px-1.5 text-[9px] text-[#9eaaa3]">
                    {installedCount}
                  </span>
                )}
              </button>
            </div>

            {/* =================================================
                SEARCH
            ================================================== */}

            {view === "discover" && (
              <div className="mb-6">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68716c]"
                  />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search skills..."
                    autoComplete="off"
                    className="h-[48px] w-full rounded-[9px] border border-[#2b312e] bg-[#151918] pl-11 pr-11 text-[13px] text-[#e4e8e6] outline-none placeholder:text-[#59615d] transition focus:border-[#465149] focus:bg-[#171c1a]"
                  />

                  {loading && (
                    <Loader2
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#91a99a]"
                    />
                  )}

                  {!loading && query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[5px] text-[#68716c] transition hover:bg-[#202522] hover:text-[#c4cbc7]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {!query.trim() && (
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-[#555e59]">
                    <Sparkles size={11} />
                    Try searching for React, testing, Git, TypeScript,
                    Next.js...
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                MESSAGES
            ================================================== */}

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-[8px] border border-[#513a38] bg-[#211817] px-4 py-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b77972]" />

                <div className="min-w-0 text-[11px] leading-5 text-[#c99b96]">
                  {error}
                </div>

                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto text-[#75514e] hover:text-[#b9908b]"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {notice && (
              <div className="mb-4 flex items-center gap-3 rounded-[8px] border border-[#304238] bg-[#17201b] px-4 py-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#26382d]">
                  <Check size={11} className="text-[#9eb4a6]" />
                </div>

                <div className="text-[11px] text-[#9caf9f]">{notice}</div>
              </div>
            )}

            {/* =================================================
                DISCOVER EMPTY STATE
            ================================================== */}

            {view === "discover" && !query.trim() && !loading && (
              <div className="mb-6 rounded-[11px] border border-[#292f2c] bg-[#141817] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-[#303833] bg-[#1a201d]">
                    <Sparkles size={18} className="text-[#91a99a]" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#dce1de]">
                      Give Nexora new abilities
                    </div>

                    <p className="mt-1.5 max-w-[650px] text-[11px] leading-5 text-[#68716c]">
                      Search the Skills ecosystem and install capabilities that
                      your agent can use inside your projects.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {["React", "Next.js", "Git", "Testing", "TypeScript"].map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuery(suggestion)}
                            className="rounded-[6px] border border-[#292f2c] bg-[#181d1b] px-2.5 py-1.5 text-[10px] text-[#727b76] transition hover:border-[#39433d] hover:bg-[#1e2521] hover:text-[#aeb7b2]"
                          >
                            {suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                SECTION HEADER
            ================================================== */}

            {(query.trim() || view === "installed") && (
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#59625d]">
                  {view === "installed"
                    ? "Installed skills"
                    : loading
                      ? "Searching"
                      : `${visibleSkills.length} skills`}
                </div>

                {view === "installed" && installedCount > 0 && (
                  <div className="text-[10px] text-[#535c57]">
                    Stored locally in Nexora
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {visibleSkills.length === 0 && (
              <div className="flex min-h-[270px] items-center justify-center rounded-[11px] border border-dashed border-[#292f2c] bg-[#111413]">
                <div className="max-w-[300px] px-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#181d1b]">
                    {view === "installed" ? (
                      <Package size={19} className="text-[#555e59]" />
                    ) : (
                      <Search size={19} className="text-[#555e59]" />
                    )}
                  </div>

                  <div className="text-[12px] font-medium text-[#747d78]">
                    {view === "installed"
                      ? loadingInstalled
                        ? "Loading installed skills..."
                        : "No skills installed yet"
                      : loading
                        ? "Searching skills..."
                        : query.trim()
                          ? "No matching skills"
                          : "Search for a skill"}
                  </div>

                  <div className="mt-1.5 text-[10px] leading-4 text-[#505853]">
                    {view === "installed"
                      ? "Install a skill from Discover to see it here."
                      : query.trim()
                        ? "Try another search term or a broader keyword."
                        : "Search the registry to find capabilities for Nexora."}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                SKILL LIST
            ================================================== */}

            {visibleSkills.length > 0 && (
              <div className="grid gap-2">
                {visibleSkills.map((skill) => {
                  const normalizedId = getSkillKey(skill.id);

                  const isInstalled = installedIds.has(normalizedId);

                  const isSelected =
                    selected && getSkillKey(selected.id) === normalizedId;

                  const isInstalling = installing === normalizedId;

                  return (
                    <div
                      key={normalizedId}
                      className={`group flex items-center gap-3 rounded-[10px] border p-3 transition ${
                        isSelected
                          ? "border-[#465149] bg-[#1a211d]"
                          : "border-[#292f2c] bg-[#151918] hover:border-[#363f3a] hover:bg-[#181d1b]"
                      }`}
                    >
                      {/* ICON */}

                      <button
                        type="button"
                        onClick={() => selectSkill(skill)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303733] bg-[#1b201e]">
                          <Package size={17} className="text-[#91a99a]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="truncate text-[12px] font-medium text-[#dce1de]">
                              {prettyName(skill)}
                            </div>

                            {isInstalled && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#35443b] bg-[#19211d] px-1.5 py-0.5 text-[9px] text-[#9fb2a6]">
                                <Check size={8} />
                                Installed
                              </span>
                            )}
                          </div>

                          <div className="mt-1 truncate text-[10px] text-[#636c67]">
                            {skill.source}
                          </div>
                        </div>

                        <div className="hidden shrink-0 items-center gap-5 sm:flex">
                          {"installs" in skill && (
                            <div className="text-right">
                              <div className="text-[11px] text-[#7b847f]">
                                {formatInstalls(skill.installs)}
                              </div>

                              <div className="text-[8px] uppercase tracking-[0.06em] text-[#4e5752]">
                                installs
                              </div>
                            </div>
                          )}

                          <ChevronRight size={14} className="text-[#454d49]" />
                        </div>
                      </button>

                      {/* ACTION */}

                      {isInstalled ? (
                        <button
                          type="button"
                          onClick={() => selectSkill(skill)}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] border border-[#2e3933] bg-[#1b211e] px-2.5 text-[10px] text-[#8e9b94] transition hover:border-[#405047] hover:bg-[#222a25] hover:text-[#b4c0b8]"
                        >
                          Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => installSkill(skill)}
                          disabled={isInstalling}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] bg-[#8fa797] px-3 text-[10px] font-medium text-[#111513] transition hover:bg-[#a1b5a8] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isInstalling ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Installing
                            </>
                          ) : (
                            <>
                              <Package size={12} />
                              Install
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* =====================================================
            DETAIL PANEL
        ====================================================== */}

        {selected && (
          <aside className="w-[390px] shrink-0 overflow-y-auto border-l border-[#252a28] bg-[#111413]">
            <div className="p-5">
              {/* HEADER */}

              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-[#303733] bg-[#1a201d]">
                  <Package size={18} className="text-[#91a99a]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-[#e0e5e2]">
                    {prettyName(selected)}
                  </div>

                  <div className="mt-1 truncate text-[10px] text-[#626b66]">
                    {selected.source}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setAudit(null);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[#68716c] transition hover:bg-[#1d2220] hover:text-[#c4cbc7]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* STATUS */}

              <div className="mb-5 flex items-center gap-2 rounded-[8px] border border-[#292f2c] bg-[#151918] px-3 py-2.5">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    installedIds.has(getSkillKey(selected.id))
                      ? "bg-[#86a792]"
                      : "bg-[#59625d]"
                  }`}
                />

                <span className="text-[10px] text-[#77807b]">
                  {installedIds.has(getSkillKey(selected.id))
                    ? "Installed in Nexora"
                    : "Available to install"}
                </span>
              </div>

              {/* ACTIONS */}

              <div className="grid gap-2">
                {installedIds.has(getSkillKey(selected.id)) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateSkill(selected)}
                      disabled={updating === getSkillKey(selected.id)}
                      className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#354039] bg-[#1d251f] text-[11px] font-medium text-[#a8b8ae] transition hover:bg-[#232d27] disabled:opacity-50"
                    >
                      {updating === getSkillKey(selected.id) ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      Update skill
                    </button>

                    <button
                      type="button"
                      onClick={() => uninstallSkill(selected)}
                      disabled={uninstalling === getSkillKey(selected.id)}
                      className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#493230] bg-[#241918] text-[11px] text-[#c48f89] transition hover:bg-[#2a1c1b] disabled:opacity-50"
                    >
                      {uninstalling === getSkillKey(selected.id) ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      Uninstall
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => installSkill(selected)}
                    disabled={installing === getSkillKey(selected.id)}
                    className="flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#91a99a] text-[11px] font-medium text-[#111513] transition hover:bg-[#a3b6a9] disabled:opacity-50"
                  >
                    {installing === getSkillKey(selected.id) ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Package size={13} />
                        Install skill
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openSkillPage(selected)}
                  className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#292f2c] bg-[#171b19] text-[11px] text-[#858e89] transition hover:bg-[#1d2220] hover:text-[#b8c0bc]"
                >
                  View on skills.sh
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* =================================================
                  SECURITY
              ================================================== */}

              <div className="my-6 h-px bg-[#252a28]" />

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#68716c]">
                    <ShieldCheck size={13} />
                    Security
                  </div>

                  {loadingAudit && (
                    <Loader2
                      size={12}
                      className="animate-spin text-[#68716c]"
                    />
                  )}
                </div>

                {loadingAudit && (
                  <div className="rounded-[8px] border border-[#292f2c] bg-[#151918] px-3 py-3 text-[10px] text-[#69716d]">
                    Checking security information...
                  </div>
                )}

                {!loadingAudit && audit && audit.audits.length === 0 && (
                  <div className="rounded-[8px] border border-[#292f2c] bg-[#151918] px-3 py-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#777f7b]">
                      <ShieldCheck size={12} />
                      No published audit
                    </div>

                    <p className="mt-1.5 text-[9px] leading-4 text-[#555e59]">
                      There is currently no published security audit available
                      for this skill.
                    </p>
                  </div>
                )}

                {!loadingAudit && audit && audit.audits.length > 0 && (
                  <div className="grid gap-2">
                    {audit.audits.map((item, index) => {
                      const risk = getRiskClass(item.riskLevel || item.status);

                      return (
                        <div
                          key={`${item.provider ?? "provider"}-${index}`}
                          className="rounded-[8px] border border-[#292f2c] bg-[#151918] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-medium text-[#aeb6b2]">
                              {item.provider || "Security provider"}
                            </span>

                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[8px] uppercase ${risk.text} ${risk.bg} ${risk.border}`}
                            >
                              {item.riskLevel || item.status || "Unknown"}
                            </span>
                          </div>

                          {item.summary && (
                            <p className="mt-2 text-[9px] leading-4 text-[#69716d]">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* =================================================
                  INFORMATION
              ================================================== */}

              <div className="my-6 h-px bg-[#252a28]" />

              <section>
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#68716c]">
                  Information
                </div>

                <div className="grid gap-1.5">
                  <InfoRow label="Source" value={selected.source} />

                  <InfoRow label="Skill" value={selected.slug} />

                  {"installs" in selected && (
                    <InfoRow
                      label="Installs"
                      value={formatInstalls(selected.installs)}
                    />
                  )}

                  {"path" in selected && (
                    <InfoRow
                      label="Local path"
                      value={selected.path || "Managed by skills CLI"}
                      icon={<FolderOpen size={11} />}
                    />
                  )}

                  {"enabled" in selected && (
                    <InfoRow
                      label="Status"
                      value={selected.enabled ? "Enabled" : "Disabled"}
                    />
                  )}
                </div>
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[7px] border border-[#252b28] bg-[#151918] px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.08em] text-[#555e59]">
        {icon}
        {label}
      </div>

      <div className="break-all text-[10px] leading-4 text-[#929b96]">
        {value}
      </div>
    </div>
  );
}
