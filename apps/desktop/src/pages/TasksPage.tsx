import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Square,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

type TaskStatus =
  | "todo"
  | "in-progress"
  | "stopped"
  | "completed"
  | "cancelled";

type TaskFrequency = "once" | "daily" | "weekly" | "monthly";

interface Task {
  id: string;
  title: string;
  timing: string;
  frequency: TaskFrequency;
  target: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

interface TasksPageProps {}

const STORAGE_KEY = "nexora.tasks";

const MODEL_OPTIONS = [
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
  },
  {
    id: "anthropic/claude-opus-4-1",
    name: "Claude Opus",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    name: "Claude Sonnet",
    provider: "Anthropic",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
  },
  {
    id: "openrouter/auto",
    name: "OpenRouter Auto",
    provider: "OpenRouter",
  },
];

const STATUS_OPTIONS: {
  id: TaskStatus | "all";
  label: string;
}[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "todo",
    label: "Todo",
  },
  {
    id: "in-progress",
    label: "In Progress",
  },
  {
    id: "stopped",
    label: "Stopped",
  },
  {
    id: "completed",
    label: "Completed",
  },
  {
    id: "cancelled",
    label: "Cancelled",
  },
];

const FREQUENCY_OPTIONS: {
  id: TaskFrequency;
  label: string;
}[] = [
  {
    id: "once",
    label: "Once",
  },
  {
    id: "daily",
    label: "Daily",
  },
  {
    id: "weekly",
    label: "Weekly",
  },
  {
    id: "monthly",
    label: "Monthly",
  },
];

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "Todo";

    case "in-progress":
      return "In Progress";

    case "stopped":
      return "Stopped";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getFrequencyLabel(frequency: TaskFrequency) {
  switch (frequency) {
    case "once":
      return "Once";

    case "daily":
      return "Daily";

    case "weekly":
      return "Weekly";

    case "monthly":
      return "Monthly";

    default:
      return frequency;
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "completed":
      return <Check size={13} strokeWidth={2.5} />;

    case "cancelled":
      return <X size={13} strokeWidth={2.5} />;

    case "stopped":
      return <Square size={11} strokeWidth={2.5} />;

    case "in-progress":
      return <Zap size={12} strokeWidth={2.5} />;

    default:
      return <Circle size={11} strokeWidth={2} />;
  }
}

function getStatusClass(status: TaskStatus) {
  switch (status) {
    case "completed":
      return "border-neutral-300 bg-neutral-100 text-black";

    case "cancelled":
      return "border-neutral-300 bg-neutral-100 text-neutral-700";

    case "stopped":
      return "border-neutral-300 bg-neutral-100 text-neutral-700";

    case "in-progress":
      return "border-black bg-black text-white";

    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
  }
}

function formatTiming(value: string) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export default function TasksPage(_: TasksPageProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [timing, setTiming] = useState("");
  const [frequency, setFrequency] = useState<TaskFrequency>("once");
  const [target, setTarget] = useState(MODEL_OPTIONS[0].id);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...tasks]
      .filter((task) => {
        if (statusFilter === "all") {
          return true;
        }

        return task.status === statusFilter;
      })
      .filter((task) => {
        if (!query) {
          return true;
        }

        const targetModel = MODEL_OPTIONS.find(
          (model) => model.id === task.target,
        );

        return (
          task.title.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query) ||
          task.frequency.toLowerCase().includes(query) ||
          targetModel?.name.toLowerCase().includes(query) ||
          targetModel?.provider.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
  }, [tasks, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      stopped: tasks.filter((task) => task.status === "stopped").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      cancelled: tasks.filter((task) => task.status === "cancelled").length,
    };
  }, [tasks]);

  function resetForm() {
    setTitle("");
    setTiming("");
    setFrequency("once");
    setTarget(MODEL_OPTIONS[0].id);
    setEditingTask(null);
  }

  function openAddTask() {
    resetForm();
    setIsAddOpen(true);
  }

  function openEditTask(task: Task) {
    setTitle(task.title);
    setTiming(task.timing);
    setFrequency(task.frequency);
    setTarget(task.target);
    setEditingTask(task);
    setIsAddOpen(true);
    setOpenMenu(null);
  }

  function closeModal() {
    setIsAddOpen(false);
    resetForm();
  }

  function saveTask() {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    const now = Date.now();

    if (editingTask) {
      setTasks((current) =>
        current.map((task) => {
          if (task.id !== editingTask.id) {
            return task;
          }

          return {
            ...task,
            title: cleanTitle,
            timing,
            frequency,
            target,
            updatedAt: now,
          };
        }),
      );
    } else {
      const newTask: Task = {
        id: generateId(),
        title: cleanTitle,
        timing,
        frequency,
        target,
        status: "todo",
        createdAt: now,
        updatedAt: now,
      };

      setTasks((current) => [newTask, ...current]);
    }

    closeModal();
  }

  function deleteTask(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));

    setOpenMenu(null);
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          status,
          updatedAt: Date.now(),
        };
      }),
    );

    setOpenMenu(null);
  }

  function toggleCompleted(task: Task) {
    const nextStatus = task.status === "completed" ? "todo" : "completed";

    updateStatus(task.id, nextStatus);
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#fafafa] text-[#111111]">
      <div className="flex h-full flex-col">
        {/* Header */}
        <PageHeader
          icon={Check}
          title="Tasks"
          subtitle="Manage and schedule your tasks"
          actions={
            <>
              <div className="hidden h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-black" />

                <span className="text-xs font-medium text-neutral-600">
                  {tasks.length} tasks
                </span>
              </div>

              <button
                type="button"
                onClick={openAddTask}
                className="flex h-9 items-center gap-2 rounded-xl bg-black px-3.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98]"
              >
                <Plus size={15} strokeWidth={2} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </>
          }
        />

        {/* Toolbar */}
        <div className="shrink-0 border-b border-neutral-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={15}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks..."
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-9 text-xs text-black outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-black/[0.04]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {STATUS_OPTIONS.map((option) => {
                const active = statusFilter === option.id;

                const count =
                  option.id === "all"
                    ? counts.all
                    : option.id === "todo"
                      ? counts.todo
                      : option.id === "in-progress"
                        ? counts.inProgress
                        : option.id === "stopped"
                          ? counts.stopped
                          : option.id === "completed"
                            ? counts.completed
                            : counts.cancelled;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStatusFilter(option.id)}
                    className={[
                      "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-all",
                      active
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black",
                    ].join(" ")}
                  >
                    {option.label}

                    <span
                      className={[
                        "min-w-[18px] rounded-md px-1 py-0.5 text-center text-[9px]",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-neutral-100 text-neutral-500",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-7">
            {filteredTasks.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-500">
                  {search || statusFilter !== "all" ? (
                    <Search size={22} strokeWidth={1.7} />
                  ) : (
                    <Check size={22} strokeWidth={1.8} />
                  )}
                </div>

                <h2 className="mt-4 text-sm font-semibold text-black">
                  {search || statusFilter !== "all"
                    ? "No tasks found"
                    : "No tasks yet"}
                </h2>

                <p className="mt-1.5 max-w-sm text-xs leading-5 text-neutral-500">
                  {search || statusFilter !== "all"
                    ? "Try changing your search or status filter."
                    : "Create your first task to start scheduling work."}
                </p>

                {!search && statusFilter === "all" && (
                  <button
                    type="button"
                    onClick={openAddTask}
                    className="mt-5 flex h-9 items-center gap-2 rounded-xl bg-black px-3.5 text-xs font-medium text-white transition hover:bg-neutral-800"
                  >
                    <Plus size={14} />
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const targetModel = MODEL_OPTIONS.find(
                    (model) => model.id === task.target,
                  );

                  return (
                    <div
                      key={task.id}
                      className={[
                        "group rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200",
                        task.status === "completed"
                          ? "border-neutral-200"
                          : "border-neutral-200 hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-4 p-4 sm:p-5">
                        <button
                          type="button"
                          onClick={() => toggleCompleted(task)}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                            task.status === "completed"
                              ? "border-black bg-black text-white"
                              : "border-neutral-300 text-transparent hover:border-black hover:text-black"
                          }`}
                          title={
                            task.status === "completed"
                              ? "Mark as todo"
                              : "Mark as completed"
                          }
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3
                                className={[
                                  "truncate text-[13px] font-semibold tracking-[-0.01em]",
                                  task.status === "completed"
                                    ? "text-neutral-400 line-through"
                                    : "text-black",
                                ].join(" ")}
                              >
                                {task.title}
                              </h3>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {/* Status */}
                                <span
                                  className={[
                                    "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium",
                                    getStatusClass(task.status),
                                  ].join(" ")}
                                >
                                  {getStatusIcon(task.status)}
                                  {getStatusLabel(task.status)}
                                </span>

                                {/* Timing */}
                                <span className="flex h-7 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-[10px] text-neutral-600">
                                  <CalendarClock size={12} />
                                  {formatTiming(task.timing)}
                                </span>

                                {/* Frequency */}
                                <span className="flex h-7 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-[10px] text-neutral-600">
                                  <Clock3 size={12} />
                                  {getFrequencyLabel(task.frequency)}
                                </span>

                                {/* Target */}
                                <span className="flex h-7 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-[10px] font-medium text-neutral-700">
                                  <Zap size={11} />
                                  {targetModel?.name || task.target}
                                </span>
                              </div>
                            </div>

                            {/* More */}
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu === task.id ? null : task.id,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-neutral-400 opacity-0 transition-all hover:border-neutral-200 hover:bg-neutral-50 hover:text-black group-hover:opacity-100"
                              >
                                <MoreHorizontal size={17} />
                              </button>

                              {openMenu === task.id && (
                                <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                                  <button
                                    type="button"
                                    onClick={() => openEditTask(task)}
                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                                  >
                                    Edit Task
                                  </button>

                                  <div className="my-1 h-px bg-neutral-100" />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(task.id, "in-progress")
                                    }
                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                                  >
                                    Mark In Progress
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(task.id, "stopped")
                                    }
                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                                  >
                                    Stop Task
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(task.id, "cancelled")
                                    }
                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                                  >
                                    Cancel Task
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(task.id, "completed")
                                    }
                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                                  >
                                    Complete Task
                                  </button>

                                  <div className="my-1 h-px bg-neutral-100" />

                                  <button
                                    type="button"
                                    onClick={() => deleteTask(task.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                                  >
                                    <Trash2 size={13} />
                                    Delete Task
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  {editingTask ? (
                    <Zap size={17} strokeWidth={1.8} />
                  ) : (
                    <Plus size={18} strokeWidth={2} />
                  )}
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-black">
                    {editingTask ? "Edit Task" : "Create Task"}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {editingTask
                      ? "Update the task details and execution settings."
                      : "Set up what Nexora should do and when it should run."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-neutral-400 transition hover:border-neutral-200 hover:bg-neutral-50 hover:text-black"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 p-5 sm:p-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-black">
                  Task title
                </label>

                <div className="relative">
                  <input
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && title.trim()) {
                        saveTask();
                      }
                    }}
                    placeholder="What should Nexora do?"
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-xs text-black outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-black/[0.04]"
                  />
                </div>

                <p className="mt-1.5 text-[10px] text-neutral-400">
                  Give your task a short and clear name.
                </p>
              </div>

              {/* Timing */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-black">
                    Schedule
                  </label>

                  <span className="text-[10px] text-neutral-400">Optional</span>
                </div>

                <div className="relative">
                  <CalendarClock
                    size={15}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="datetime-local"
                    value={timing}
                    onChange={(event) => setTiming(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 pl-10 text-xs text-black outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-black/[0.04]"
                  />
                </div>

                <p className="mt-1.5 text-[10px] text-neutral-400">
                  Choose when this task should start.
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-black">
                  Frequency
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FREQUENCY_OPTIONS.map((option) => {
                    const active = frequency === option.id;

                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setFrequency(option.id)}
                        className={[
                          "flex h-10 items-center justify-center rounded-xl border text-[11px] font-medium transition-all",
                          active
                            ? "border-black bg-black text-white shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-black">
                  Execution model
                </label>

                <div className="relative">
                  <select
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 pr-10 text-xs text-black outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-black/[0.04]"
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        className="bg-white text-black"
                      >
                        {model.name} — {model.provider}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>

                <p className="mt-1.5 text-[10px] text-neutral-400">
                  Select the model that will execute this task.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm">
                    <Zap size={13} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-black">
                      Task summary
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                      {title.trim()
                        ? title.trim()
                        : "Your task title will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/70 px-5 py-4 sm:px-6">
              <p className="hidden text-[10px] text-neutral-400 sm:block">
                Press Enter to save
              </p>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-9 rounded-xl border border-neutral-200 bg-white px-3.5 text-[11px] font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-black"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveTask}
                  disabled={!title.trim()}
                  className="flex h-9 items-center gap-2 rounded-xl bg-black px-4 text-[11px] font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={14} strokeWidth={2.2} />
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
