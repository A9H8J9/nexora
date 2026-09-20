import { X } from "lucide-react";
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
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create project</h2>
            <p>Create a workspace for your conversations.</p>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Project name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My project"
              autoFocus
              required
            />
          </label>

          <label>
            Project path
            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="D:\projects\my-project"
            />
            <span className="field-hint">
              The native folder picker will be connected later.
            </span>
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
