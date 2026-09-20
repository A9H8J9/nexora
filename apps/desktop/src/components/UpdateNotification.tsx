import { Download, RefreshCw, X } from "lucide-react";
import type { Update } from "@tauri-apps/plugin-updater";
import type { UpdaterStatus } from "../hooks/useUpdater";

interface UpdateNotificationProps {
  status: UpdaterStatus;
  update: Update | null;
  progress: number;
  error: string | null;
  onInstall: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

export default function UpdateNotification({
  status,
  update,
  progress,
  error,
  onInstall,
  onRetry,
  onDismiss,
}: UpdateNotificationProps) {
  if (status === "idle" || status === "checking" || !update) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] w-[360px] overflow-hidden rounded-2xl border border-black/10 bg-[#111314] text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#91a99a]/12 text-[#a8c0af]">
          <Download size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-medium text-white">
                Update available
              </h3>

              <p className="mt-1 text-[12px] leading-5 text-white/55">
                Nexora {update.version} is available.
              </p>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
              aria-label="Dismiss update"
            >
              <X size={15} />
            </button>
          </div>

          {status === "available" && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-white/35">
                New version ready to install
              </span>

              <button
                type="button"
                onClick={onInstall}
                className="rounded-lg bg-[#91a99a] px-3 py-1.5 text-[11px] font-medium text-[#0d0f10] transition hover:bg-[#a5bca9]"
              >
                Update now
              </button>
            </div>
          )}

          {status === "downloading" && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] text-white/45">
                  Downloading update...
                </span>

                <span className="text-[11px] tabular-nums text-white/55">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[#91a99a] transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "ready" && (
            <div className="mt-4 rounded-xl border border-[#91a99a]/15 bg-[#91a99a]/8 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-[#a8c0af]" />

                <p className="text-[11px] leading-4 text-white/70">
                  Update downloaded successfully. Nexora will restart to
                  complete the update.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4">
              <div className="rounded-xl border border-red-400/10 bg-red-400/5 px-3 py-2.5">
                <p className="line-clamp-3 text-[11px] leading-4 text-red-200/70">
                  {error ?? "Something went wrong while updating Nexora."}
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}