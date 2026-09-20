import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Cpu,
  Download,
  Globe,
  HardDrive,
  Keyboard,
  Palette,
  Paperclip,
  Plug,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import { useEffect, useState, type ElementType, type ReactNode } from "react";

type SettingsSection =
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

interface SettingsPageProps {
  section: SettingsSection;
  onBack: () => void;
}

interface SettingRowProps {
  icon: ElementType;
  title: string;
  description?: string;
  children: ReactNode;
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-[#262b29] py-5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#292f2c] bg-[#151918] text-[#89958f]">
          <Icon size={15} strokeWidth={1.7} />
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#e1e5e3]">{title}</div>

          {description && (
            <div className="mt-1 max-w-xl text-[11px] leading-5 text-[#69716d]">
              {description}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full border transition-all ${
        value
          ? "border-[#8fa596] bg-[#718879]"
          : "border-[#39413d] bg-[#1b201e]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#e8ece9] shadow-sm transition-all ${
          value ? "left-[21px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[150px] appearance-none rounded-lg border border-[#303733] bg-[#151918] px-3 pr-9 text-[12px] text-[#dce1de] outline-none transition focus:border-[#66786d]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#151918]"
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#69716d]"
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex h-9 items-center rounded-lg border border-[#303733] bg-[#151918]">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-full w-[85px] bg-transparent px-3 text-right text-[12px] text-[#dce1de] outline-none"
      />

      {suffix && (
        <span className="pr-3 text-[11px] text-[#69716d]">{suffix}</span>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-9 w-[240px] rounded-lg border border-[#303733] bg-[#151918] px-3 text-[12px] text-[#dce1de] outline-none placeholder:text-[#525b56] focus:border-[#66786d]"
    />
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-[20px] font-medium tracking-[-0.02em] text-[#e5e9e7]">
        {title}
      </h1>

      <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-[#69716d]">
        {description}
      </p>
    </div>
  );
}

export default function SettingsPage({ section, onBack }: SettingsPageProps) {
  const [dataFolder, setDataFolder] = useState(
    () => localStorage.getItem("nexora.settings.general.dataFolder") ?? "",
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("nexora.settings.general.language") ?? "en",
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("nexora.settings.appearance.theme") ?? "dark",
  );

  const [accentColor, setAccentColor] = useState(
    () =>
      localStorage.getItem("nexora.settings.appearance.accentColor") ?? "sage",
  );

  const [fontSize, setFontSize] = useState(() =>
    Number(localStorage.getItem("nexora.settings.appearance.fontSize") ?? "14"),
  );

  const [animations, setAnimations] = useState(
    () =>
      localStorage.getItem("nexora.settings.appearance.animations") !== "false",
  );

  const [sendShortcut, setSendShortcut] = useState(
    () => localStorage.getItem("nexora.settings.shortcuts.send") ?? "enter",
  );

  const [streaming, setStreaming] = useState(
    () =>
      localStorage.getItem("nexora.settings.hardware.streaming") !== "false",
  );

  const [hardwareAcceleration, setHardwareAcceleration] = useState(
    () =>
      localStorage.getItem("nexora.settings.hardware.acceleration") !== "false",
  );

  const [telemetry, setTelemetry] = useState(
    () => localStorage.getItem("nexora.settings.privacy.telemetry") === "true",
  );

  const [saveHistory, setSaveHistory] = useState(
    () => localStorage.getItem("nexora.settings.privacy.history") !== "false",
  );

  const [webSearchEnabled, setWebSearchEnabled] = useState(
    () => localStorage.getItem("nexora.settings.webSearch.enabled") !== "false",
  );

  const [searchResults, setSearchResults] = useState(() =>
    Number(localStorage.getItem("nexora.settings.webSearch.results") ?? "5"),
  );

  const [safeSearch, setSafeSearch] = useState(
    () =>
      localStorage.getItem("nexora.settings.webSearch.safeSearch") !== "false",
  );

  const [openResults, setOpenResults] = useState(
    () =>
      localStorage.getItem("nexora.settings.webSearch.openResults") !== "false",
  );

  const [showSources, setShowSources] = useState(
    () =>
      localStorage.getItem("nexora.settings.webSearch.showSources") !== "false",
  );

  const [attachmentsEnabled, setAttachmentsEnabled] = useState(
    () =>
      localStorage.getItem("nexora.settings.attachments.enabled") !== "false",
  );

  const [parsePreference, setParsePreference] = useState(
    () =>
      localStorage.getItem("nexora.settings.attachments.parsePreference") ??
      "auto",
  );

  const [autoInlineThreshold, setAutoInlineThreshold] = useState(() =>
    Number(
      localStorage.getItem("nexora.settings.attachments.autoInlineThreshold") ??
        "0.25",
    ),
  );

  const [maxFileSize, setMaxFileSize] = useState(() =>
    Number(
      localStorage.getItem("nexora.settings.attachments.maxFileSize") ?? "25",
    ),
  );

  const [topK, setTopK] = useState(() =>
    Number(localStorage.getItem("nexora.settings.attachments.topK") ?? "5"),
  );

  const [affinityThreshold, setAffinityThreshold] = useState(() =>
    Number(
      localStorage.getItem("nexora.settings.attachments.affinityThreshold") ??
        "0.2",
    ),
  );

  const [chunkSize, setChunkSize] = useState(() =>
    Number(
      localStorage.getItem("nexora.settings.attachments.chunkSize") ?? "1200",
    ),
  );

  const [overlap, setOverlap] = useState(() =>
    Number(
      localStorage.getItem("nexora.settings.attachments.overlap") ?? "200",
    ),
  );

  const [vectorSearchMode, setVectorSearchMode] = useState(
    () =>
      localStorage.getItem("nexora.settings.attachments.vectorSearchMode") ??
      "auto",
  );

  const [remoteEnabled, setRemoteEnabled] = useState(
    () =>
      localStorage.getItem("nexora.settings.integrations.remote.enabled") ===
      "true",
  );

  const [remoteUrl, setRemoteUrl] = useState(
    () => localStorage.getItem("nexora.settings.integrations.remote.url") ?? "",
  );

  const [remoteApiKey, setRemoteApiKey] = useState(
    () =>
      localStorage.getItem("nexora.settings.integrations.remote.apiKey") ?? "",
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () =>
      localStorage.getItem("nexora.settings.notifications.enabled") !== "false",
  );

  const [soundEnabled, setSoundEnabled] = useState(
    () =>
      localStorage.getItem("nexora.settings.notifications.sound") !== "false",
  );

  const [desktopNotifications, setDesktopNotifications] = useState(
    () =>
      localStorage.getItem("nexora.settings.notifications.desktop") !== "false",
  );

  useEffect(() => {
    localStorage.setItem("nexora.settings.general.dataFolder", dataFolder);

    localStorage.setItem("nexora.settings.general.language", language);

    localStorage.setItem("nexora.settings.appearance.theme", theme);

    localStorage.setItem("nexora.settings.appearance.accentColor", accentColor);

    localStorage.setItem(
      "nexora.settings.appearance.fontSize",
      String(fontSize),
    );

    localStorage.setItem(
      "nexora.settings.appearance.animations",
      String(animations),
    );

    localStorage.setItem("nexora.settings.shortcuts.send", sendShortcut);

    localStorage.setItem(
      "nexora.settings.hardware.streaming",
      String(streaming),
    );

    localStorage.setItem(
      "nexora.settings.hardware.acceleration",
      String(hardwareAcceleration),
    );

    localStorage.setItem(
      "nexora.settings.privacy.telemetry",
      String(telemetry),
    );

    localStorage.setItem(
      "nexora.settings.privacy.history",
      String(saveHistory),
    );

    localStorage.setItem(
      "nexora.settings.webSearch.enabled",
      String(webSearchEnabled),
    );

    localStorage.setItem(
      "nexora.settings.webSearch.results",
      String(searchResults),
    );

    localStorage.setItem(
      "nexora.settings.webSearch.safeSearch",
      String(safeSearch),
    );

    localStorage.setItem(
      "nexora.settings.webSearch.openResults",
      String(openResults),
    );

    localStorage.setItem(
      "nexora.settings.webSearch.showSources",
      String(showSources),
    );

    localStorage.setItem(
      "nexora.settings.attachments.enabled",
      String(attachmentsEnabled),
    );

    localStorage.setItem(
      "nexora.settings.attachments.parsePreference",
      parsePreference,
    );

    localStorage.setItem(
      "nexora.settings.attachments.autoInlineThreshold",
      String(autoInlineThreshold),
    );

    localStorage.setItem(
      "nexora.settings.attachments.maxFileSize",
      String(maxFileSize),
    );

    localStorage.setItem("nexora.settings.attachments.topK", String(topK));

    localStorage.setItem(
      "nexora.settings.attachments.affinityThreshold",
      String(affinityThreshold),
    );

    localStorage.setItem(
      "nexora.settings.attachments.chunkSize",
      String(chunkSize),
    );

    localStorage.setItem(
      "nexora.settings.attachments.overlap",
      String(overlap),
    );

    localStorage.setItem(
      "nexora.settings.attachments.vectorSearchMode",
      vectorSearchMode,
    );

    localStorage.setItem(
      "nexora.settings.integrations.remote.enabled",
      String(remoteEnabled),
    );

    localStorage.setItem("nexora.settings.integrations.remote.url", remoteUrl);

    localStorage.setItem(
      "nexora.settings.integrations.remote.apiKey",
      remoteApiKey,
    );

    localStorage.setItem(
      "nexora.settings.notifications.enabled",
      String(notificationsEnabled),
    );

    localStorage.setItem(
      "nexora.settings.notifications.sound",
      String(soundEnabled),
    );

    localStorage.setItem(
      "nexora.settings.notifications.desktop",
      String(desktopNotifications),
    );

    window.dispatchEvent(new CustomEvent("nexora-settings-change"));
  }, [
    dataFolder,
    language,
    theme,
    accentColor,
    fontSize,
    animations,
    sendShortcut,
    streaming,
    hardwareAcceleration,
    telemetry,
    saveHistory,
    webSearchEnabled,
    searchResults,
    safeSearch,
    openResults,
    showSources,
    attachmentsEnabled,
    parsePreference,
    autoInlineThreshold,
    maxFileSize,
    topK,
    affinityThreshold,
    chunkSize,
    overlap,
    vectorSearchMode,
    remoteEnabled,
    remoteUrl,
    remoteApiKey,
    notificationsEnabled,
    soundEnabled,
    desktopNotifications,
  ]);

  function exportSettings() {
    const settings: Record<string, string> = {};

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (key?.startsWith("nexora.settings.")) {
        settings[key] = localStorage.getItem(key) ?? "";
      }
    }

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "nexora-settings.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all Nexora settings to their default values?",
    );

    if (!confirmed) {
      return;
    }

    const keysToRemove: string[] = [];

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (key?.startsWith("nexora.settings.")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    window.location.reload();
  }

  function renderSection() {
    switch (section) {
      case "general":
        return (
          <>
            <SectionHeader
              title="General"
              description="Basic Nexora settings and application preferences."
            />

            <SettingRow
              icon={HardDrive}
              title="Data folder"
              description="Location used to store Nexora application data."
            >
              <TextInput
                value={dataFolder}
                onChange={setDataFolder}
                placeholder="Default location"
              />
            </SettingRow>

            <SettingRow
              icon={Globe}
              title="Language"
              description="Choose the language used by the Nexora interface."
            >
              <Select
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "en", label: "English" },
                  { value: "fa", label: "فارسی" },
                ]}
              />
            </SettingRow>
          </>
        );

      case "appearance":
        return (
          <>
            <SectionHeader
              title="Appearance"
              description="Customize how Nexora looks and feels."
            />

            <SettingRow
              icon={Palette}
              title="Theme"
              description="Choose the application color mode."
            >
              <Select
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                  { value: "system", label: "System" },
                ]}
              />
            </SettingRow>

            <SettingRow
              icon={Palette}
              title="Accent color"
              description="Choose the primary interface accent."
            >
              <Select
                value={accentColor}
                onChange={setAccentColor}
                options={[
                  { value: "sage", label: "Sage" },
                  { value: "bronze", label: "Bronze" },
                  { value: "rose", label: "Rose" },
                  { value: "gray", label: "Gray" },
                ]}
              />
            </SettingRow>

            <SettingRow
              icon={Palette}
              title="Font size"
              description="Adjust the base interface text size."
            >
              <NumberInput
                value={fontSize}
                onChange={setFontSize}
                min={11}
                max={20}
                suffix="px"
              />
            </SettingRow>

            <SettingRow
              icon={RefreshCw}
              title="Animations"
              description="Enable interface transitions and subtle motion."
            >
              <Toggle value={animations} onChange={setAnimations} />
            </SettingRow>
          </>
        );

      case "shortcuts":
        return (
          <>
            <SectionHeader
              title="Keyboard Shortcuts"
              description="Configure the keyboard behavior used throughout Nexora."
            />

            <SettingRow
              icon={Keyboard}
              title="Send message"
              description="Key used to send the current message."
            >
              <Select
                value={sendShortcut}
                onChange={setSendShortcut}
                options={[
                  { value: "enter", label: "Enter" },
                  { value: "ctrl-enter", label: "Ctrl + Enter" },
                  { value: "shift-enter", label: "Shift + Enter" },
                ]}
              />
            </SettingRow>
          </>
        );

      case "hardware":
        return (
          <>
            <SectionHeader
              title="Hardware"
              description="Control performance-related behavior."
            />

            <SettingRow
              icon={Cpu}
              title="Hardware acceleration"
              description="Allow the interface to use available hardware acceleration."
            >
              <Toggle
                value={hardwareAcceleration}
                onChange={setHardwareAcceleration}
              />
            </SettingRow>

            <SettingRow
              icon={RefreshCw}
              title="Streaming responses"
              description="Display model responses progressively as they arrive."
            >
              <Toggle value={streaming} onChange={setStreaming} />
            </SettingRow>
          </>
        );

      case "privacy":
        return (
          <>
            <SectionHeader
              title="Privacy"
              description="Control local history and optional diagnostics."
            />

            <SettingRow
              icon={Shield}
              title="Save chat history"
              description="Keep conversations available after restarting Nexora."
            >
              <Toggle value={saveHistory} onChange={setSaveHistory} />
            </SettingRow>

            <SettingRow
              icon={Shield}
              title="Anonymous diagnostics"
              description="Allow anonymous diagnostic information to be collected."
            >
              <Toggle value={telemetry} onChange={setTelemetry} />
            </SettingRow>
          </>
        );

      case "web-search":
        return (
          <>
            <SectionHeader
              title="Web Search"
              description="Configure how Nexora handles web search results."
            />

            <SettingRow
              icon={Globe}
              title="Enable web search"
              description="Allow supported models and agents to use web search."
            >
              <Toggle value={webSearchEnabled} onChange={setWebSearchEnabled} />
            </SettingRow>

            <SettingRow
              icon={Globe}
              title="Search results"
              description="Maximum number of results returned by a search."
            >
              <NumberInput
                value={searchResults}
                onChange={setSearchResults}
                min={1}
                max={20}
              />
            </SettingRow>

            <SettingRow
              icon={Shield}
              title="Safe search"
              description="Request safer search results when supported."
            >
              <Toggle value={safeSearch} onChange={setSafeSearch} />
            </SettingRow>

            <SettingRow
              icon={Globe}
              title="Open results"
              description="Allow Nexora to open relevant search results."
            >
              <Toggle value={openResults} onChange={setOpenResults} />
            </SettingRow>

            <SettingRow
              icon={Globe}
              title="Show sources"
              description="Display source information alongside search results."
            >
              <Toggle value={showSources} onChange={setShowSources} />
            </SettingRow>
          </>
        );

      case "attachments":
        return (
          <>
            <SectionHeader
              title="Attachments"
              description="Configure file parsing, retrieval and vector search."
            />

            <SettingRow
              icon={Paperclip}
              title="Enable attachments"
              description="Allow files to be attached to conversations."
            >
              <Toggle
                value={attachmentsEnabled}
                onChange={setAttachmentsEnabled}
              />
            </SettingRow>

            <SettingRow
              icon={Paperclip}
              title="Parse preference"
              description="Choose how attached files should be processed."
            >
              <Select
                value={parsePreference}
                onChange={setParsePreference}
                options={[
                  { value: "auto", label: "Automatic" },
                  { value: "text", label: "Text" },
                  { value: "document", label: "Document" },
                ]}
              />
            </SettingRow>

            <SettingRow
              icon={Paperclip}
              title="Auto inline threshold"
              description="Threshold used when deciding whether content should be placed directly into the prompt."
            >
              <NumberInput
                value={autoInlineThreshold}
                onChange={setAutoInlineThreshold}
                min={0}
                max={1}
                step={0.05}
              />
            </SettingRow>

            <SettingRow
              icon={Paperclip}
              title="Maximum file size"
              description="Maximum supported attachment size."
            >
              <NumberInput
                value={maxFileSize}
                onChange={setMaxFileSize}
                min={1}
                max={500}
                suffix="MB"
              />
            </SettingRow>

            <SettingRow
              icon={Cpu}
              title="Top K"
              description="Number of relevant chunks retrieved from indexed content."
            >
              <NumberInput value={topK} onChange={setTopK} min={1} max={20} />
            </SettingRow>

            <SettingRow
              icon={Cpu}
              title="Affinity threshold"
              description="Minimum similarity required for retrieved content."
            >
              <NumberInput
                value={affinityThreshold}
                onChange={setAffinityThreshold}
                min={0}
                max={1}
                step={0.05}
              />
            </SettingRow>

            <SettingRow
              icon={Cpu}
              title="Chunk size"
              description="Number of characters used for each indexed chunk."
            >
              <NumberInput
                value={chunkSize}
                onChange={setChunkSize}
                min={200}
                max={5000}
              />
            </SettingRow>

            <SettingRow
              icon={Cpu}
              title="Chunk overlap"
              description="Number of overlapping characters between chunks."
            >
              <NumberInput
                value={overlap}
                onChange={setOverlap}
                min={0}
                max={1000}
              />
            </SettingRow>

            <SettingRow
              icon={Cpu}
              title="Vector search mode"
              description="Choose how vector retrieval should be selected."
            >
              <Select
                value={vectorSearchMode}
                onChange={setVectorSearchMode}
                options={[
                  { value: "auto", label: "Automatic" },
                  { value: "vector", label: "Vector" },
                  { value: "keyword", label: "Keyword" },
                ]}
              />
            </SettingRow>
          </>
        );

      case "integrations":
        return (
          <>
            <SectionHeader
              title="Integrations"
              description="Connect Nexora to external services and remote instances."
            />

            <SettingRow
              icon={Plug}
              title="Remote"
              description="Connect Nexora to a remote Nexora instance."
            >
              <Toggle value={remoteEnabled} onChange={setRemoteEnabled} />
            </SettingRow>

            {remoteEnabled && (
              <>
                <SettingRow
                  icon={Globe}
                  title="Remote URL"
                  description="Address of the remote Nexora instance."
                >
                  <TextInput
                    value={remoteUrl}
                    onChange={setRemoteUrl}
                    placeholder="https://example.com"
                  />
                </SettingRow>

                <SettingRow
                  icon={Shield}
                  title="API key"
                  description="Authentication key used for the remote connection."
                >
                  <TextInput
                    value={remoteApiKey}
                    onChange={setRemoteApiKey}
                    placeholder="API key"
                  />
                </SettingRow>
              </>
            )}
          </>
        );

      case "notifications":
        return (
          <>
            <SectionHeader
              title="Notifications"
              description="Control how Nexora notifies you about events."
            />

            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Enable Nexora notifications."
            >
              <Toggle
                value={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
            </SettingRow>

            <SettingRow
              icon={Volume2}
              title="Notification sound"
              description="Play a sound when a notification is received."
            >
              <Toggle value={soundEnabled} onChange={setSoundEnabled} />
            </SettingRow>

            <SettingRow
              icon={Bell}
              title="Desktop notifications"
              description="Allow Nexora to display system notifications."
            >
              <Toggle
                value={desktopNotifications}
                onChange={setDesktopNotifications}
              />
            </SettingRow>
          </>
        );

      case "data-storage":
        return (
          <>
            <SectionHeader
              title="Data & Storage"
              description="Manage Nexora data and local application settings."
            />

            <SettingRow
              icon={Download}
              title="Export settings"
              description="Create a JSON backup of your Nexora settings."
            >
              <button
                type="button"
                onClick={exportSettings}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#303733] bg-[#151918] px-3 text-[12px] text-[#cbd2ce] transition hover:border-[#4a5750] hover:bg-[#1c211f]"
              >
                <Download size={14} />
                Export
              </button>
            </SettingRow>

            <SettingRow
              icon={Upload}
              title="Import settings"
              description="Importing settings can be added when the desktop file picker is connected."
            >
              <button
                type="button"
                disabled
                className="flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-[#292f2c] bg-[#151918] px-3 text-[12px] text-[#555e59]"
              >
                <Upload size={14} />
                Import
              </button>
            </SettingRow>

            <SettingRow
              icon={Trash2}
              title="Reset settings"
              description="Remove all saved Nexora settings and restore defaults."
            >
              <button
                type="button"
                onClick={resetSettings}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#4a3434] bg-[#201717] px-3 text-[12px] text-[#c99c9c] transition hover:border-[#684747] hover:bg-[#281b1b]"
              >
                <Trash2 size={14} />
                Reset
              </button>
            </SettingRow>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#0d0f10]">
      <div className="mx-auto min-h-full w-full max-w-4xl px-10 py-8">
        <div className="mb-8 flex items-center gap-4 border-b border-[#262b29] pb-5">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 items-center gap-2 rounded-lg border border-transparent px-2.5 text-[12px] text-[#7b857f] transition hover:border-[#303733] hover:bg-[#171b19] hover:text-[#d6dcd8]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="h-4 w-px bg-[#2b302e]" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#303733] bg-[#151918]">
              <Check size={14} className="text-[#91a99a]" />
            </div>

            <span className="text-[13px] font-medium text-[#dfe4e1]">
              Settings
            </span>
          </div>
        </div>

        {renderSection()}
      </div>
    </main>
  );
}
