import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
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
import PageHeader from "../components/PageHeader";

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

interface SkillsPageProps {}

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
      text: "text-neutral-800",
      bg: "bg-neutral-100",
      border: "border-neutral-300",
    };
  }

  if (value === "MEDIUM") {
    return {
      text: "text-neutral-700",
      bg: "bg-neutral-50",
      border: "border-neutral-200",
    };
  }

  return {
    text: "text-neutral-600",
    bg: "bg-white",
    border: "border-neutral-200",
  };
}

export default function SkillsPage(_: SkillsPageProps = {}) {
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

      const installedSkill = createInstalledSkill(skill);

      setInstalled((current) => {
        const exists = current.some((item) => getSkillKey(item.id) === key);

        if (exists) {
          return current;
        }

        return [...current, installedSkill];
      });

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

    const previousInstalled = installed;

    try {
      await invoke("uninstall_skill", {
        id: skill.id,
      });

      setInstalled((current) =>
        current.filter((item) => getSkillKey(item.id) !== key),
      );

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
    <div className="flex h-full w-full min-h-0 flex-col bg-[#fafafa] text-[#111111]">
      <PageHeader
        icon={Sparkles}
        title="Skills"
        subtitle="Discover and manage your skills"
        actions={
          <>
            {/* Installed count */}
            <div className="hidden h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <span className="text-xs font-medium text-neutral-600">
                {installed.length} installed
              </span>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadInstalled}
              disabled={loadingInstalled}
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh installed skills"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
                className={
                  loadingInstalled
                    ? "animate-spin"
                    : "transition-transform duration-300 group-hover:rotate-45"
                }
              />
            </button>

            <button
              type="button"
              onClick={() => openUrl("https://skills.sh")}
              className="hidden h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black sm:flex"
            >
              <ExternalLink size={14} strokeWidth={1.8} />
              <span>skills.sh</span>
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1">
        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1050px] px-5 py-8 sm:px-8">
            {/* =================================================
                HERO
            ================================================== */}

            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                <span>Build</span>
                <ChevronRight size={11} />
                <span className="text-neutral-500">Skills</span>
              </div>

              <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
                {view === "installed" ? "Your skills" : "Discover skills"}
              </h1>

              <p className="mt-1.5 max-w-[620px] text-[12px] leading-5 text-neutral-500">
                {view === "installed"
                  ? "Skills currently available to Nexora."
                  : "Find reusable capabilities for coding, research, development, and more."}
              </p>
            </div>

            {/* =================================================
                TABS
            ================================================== */}

            <div className="mb-5 flex w-fit items-center rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <button
                type="button"
                onClick={() => changeView("discover")}
                className={`flex h-8 items-center justify-center gap-2 rounded-lg px-4 text-[11px] transition ${
                  view === "discover"
                    ? "bg-black font-medium text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                }`}
              >
                <Search size={13} />
                Discover
              </button>

              <button
                type="button"
                onClick={() => changeView("installed")}
                className={`flex h-8 items-center justify-center gap-2 rounded-lg px-4 text-[11px] transition ${
                  view === "installed"
                    ? "bg-black font-medium text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                }`}
              >
                <Package size={13} />
                Installed
                {installedCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      view === "installed"
                        ? "bg-white/15 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {installedCount}
                  </span>
                )}
              </button>
            </div>

            {/* =================================================
                SEARCH
            ================================================== */}

            {view === "discover" && (
              <div className="mb-7">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search skills..."
                    autoComplete="off"
                    className="h-[50px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-11 text-[13px] text-black outline-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] placeholder:text-neutral-400 transition focus:border-neutral-400 focus:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  />

                  {loading && (
                    <Loader2
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-neutral-500"
                    />
                  )}

                  {!loading && query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {!query.trim() && (
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-neutral-400">
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
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />

                <div className="min-w-0 text-[11px] leading-5 text-neutral-600">
                  {error}
                </div>

                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto text-neutral-400 transition hover:text-black"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {notice && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Check size={11} />
                </div>

                <div className="text-[11px] text-neutral-600">{notice}</div>
              </div>
            )}

            {/* =================================================
                DISCOVER EMPTY STATE
            ================================================== */}

            {view === "discover" && !query.trim() && !loading && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                      <Sparkles size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-[-0.01em] text-black">
                        Give Nexora new abilities
                      </div>

                      <p className="mt-1.5 max-w-[650px] text-[11px] leading-5 text-neutral-500">
                        Search the Skills ecosystem and install capabilities
                        that your agent can use inside your projects.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[
                          "React",
                          "Next.js",
                          "Git",
                          "Testing",
                          "TypeScript",
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuery(suggestion)}
                            className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[10px] text-neutral-500 transition hover:border-neutral-300 hover:bg-white hover:text-black"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  {view === "installed"
                    ? "Installed skills"
                    : loading
                      ? "Searching"
                      : `${visibleSkills.length} skills`}
                </div>

                {view === "installed" && installedCount > 0 && (
                  <div className="text-[10px] text-neutral-400">
                    Stored locally in Nexora
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {visibleSkills.length === 0 && (
              <div className="flex min-h-[270px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white">
                <div className="max-w-[300px] px-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
                    {view === "installed" ? (
                      <Package size={19} className="text-neutral-400" />
                    ) : (
                      <Search size={19} className="text-neutral-400" />
                    )}
                  </div>

                  <div className="text-[12px] font-medium text-neutral-700">
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

                  <div className="mt-1.5 text-[10px] leading-4 text-neutral-400">
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
                      className={`group flex items-center gap-3 rounded-xl border p-3 transition ${
                        isSelected
                          ? "border-neutral-400 bg-neutral-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                      }`}
                    >
                      {/* ICON */}

                      <button
                        type="button"
                        onClick={() => selectSkill(skill)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-black">
                          <Package size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="truncate text-[12px] font-semibold text-black">
                              {prettyName(skill)}
                            </div>

                            {isInstalled && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] text-neutral-500">
                                <Check size={8} />
                                Installed
                              </span>
                            )}
                          </div>

                          <div className="mt-1 truncate text-[10px] text-neutral-400">
                            {skill.source}
                          </div>
                        </div>

                        <div className="hidden shrink-0 items-center gap-5 sm:flex">
                          {"installs" in skill && (
                            <div className="text-right">
                              <div className="text-[11px] font-medium text-neutral-600">
                                {formatInstalls(skill.installs)}
                              </div>

                              <div className="text-[8px] uppercase tracking-[0.06em] text-neutral-400">
                                installs
                              </div>
                            </div>
                          )}

                          <ChevronRight
                            size={14}
                            className="text-neutral-300 transition group-hover:text-neutral-500"
                          />
                        </div>
                      </button>

                      {/* ACTION */}

                      {isInstalled ? (
                        <button
                          type="button"
                          onClick={() => selectSkill(skill)}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-[10px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                        >
                          Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => installSkill(skill)}
                          disabled={isInstalling}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-black px-3 text-[10px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          <aside className="w-[390px] shrink-0 overflow-y-auto border-l border-neutral-200 bg-white">
            <div className="p-5">
              {/* HEADER */}

              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <Package size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-black">
                    {prettyName(selected)}
                  </div>

                  <div className="mt-1 truncate text-[10px] text-neutral-400">
                    {selected.source}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setAudit(null);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                >
                  <X size={14} />
                </button>
              </div>

              {/* STATUS */}

              <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    installedIds.has(getSkillKey(selected.id))
                      ? "bg-black"
                      : "bg-neutral-300"
                  }`}
                />

                <span className="text-[10px] text-neutral-500">
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
                      className="flex h-9 items-center justify-center gap-2 rounded-lg bg-black text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
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
                      className="flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[11px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black disabled:opacity-50"
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
                    className="flex h-9 items-center justify-center gap-2 rounded-lg bg-black text-[11px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
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
                  className="flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[11px] text-neutral-500 transition hover:bg-neutral-50 hover:text-black"
                >
                  View on skills.sh
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* =================================================
                  SECURITY
              ================================================== */}

              <div className="my-6 h-px bg-neutral-200" />

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    <ShieldCheck size={13} />
                    Security
                  </div>

                  {loadingAudit && (
                    <Loader2
                      size={12}
                      className="animate-spin text-neutral-400"
                    />
                  )}
                </div>

                {loadingAudit && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-[10px] text-neutral-500">
                    Checking security information...
                  </div>
                )}

                {!loadingAudit && audit && audit.audits.length === 0 && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-600">
                      <ShieldCheck size={12} />
                      No published audit
                    </div>

                    <p className="mt-1.5 text-[9px] leading-4 text-neutral-400">
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
                          className="rounded-xl border border-neutral-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-medium text-neutral-700">
                              {item.provider || "Security provider"}
                            </span>

                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[8px] uppercase ${risk.text} ${risk.bg} ${risk.border}`}
                            >
                              {item.riskLevel || item.status || "Unknown"}
                            </span>
                          </div>

                          {item.summary && (
                            <p className="mt-2 text-[9px] leading-4 text-neutral-500">
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

              <div className="my-6 h-px bg-neutral-200" />

              <section>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
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
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.08em] text-neutral-400">
        {icon}
        {label}
      </div>

      <div className="break-all text-[10px] leading-4 text-neutral-600">
        {value}
      </div>
    </div>
  );
}
