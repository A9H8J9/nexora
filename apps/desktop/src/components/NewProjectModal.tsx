import { FolderPlus, X } from "lucide-react";
import { useState } from "react";

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (name: string, path: string, description: string) => void;
}

export default function NewProjectModal({
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName, path.trim(), description.trim());
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="w-[440px] max-w-[calc(100vw-32px)] rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.16)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            <FolderPlus className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-semibold text-black">
              Create project
            </h2>

            <p className="mt-1 text-[12px] text-neutral-500">
              Create a workspace for your conversations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
          >
            <X size={16} />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-black">
              Project name
            </span>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My project"
              autoFocus
              required
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-black outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-black">
              Project path
            </span>

            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="D:\projects\my-project"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-black outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />

            <span className="mt-1.5 block text-[10px] text-neutral-400">
              The native folder picker will be connected later.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-black">
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[12px] leading-5 text-black outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-3.5 py-2 text-[11px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-black px-3.5 py-2 text-[11px] font-medium text-white transition hover:bg-neutral-800"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
