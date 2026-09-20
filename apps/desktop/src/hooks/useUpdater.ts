import { useCallback, useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";

export type UpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export function useUpdater() {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    setStatus("checking");
    setError(null);

    try {
      const result = await check();

      if (!result) {
        setUpdate(null);
        setStatus("idle");
        return null;
      }

      setUpdate(result);
      setStatus("available");

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);

      setError(message);
      setStatus("error");

      return null;
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!update) {
      return;
    }

    setStatus("downloading");
    setProgress(0);
    setError(null);

    try {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            downloaded = 0;
            setProgress(0);
            break;

          case "Progress":
            downloaded += event.data.chunkLength;

            if (contentLength > 0) {
              setProgress(
                Math.min(
                  100,
                  Math.round((downloaded / contentLength) * 100)
                )
              );
            }

            break;

          case "Finished":
            setProgress(100);
            setStatus("ready");
            break;
        }
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);

      setError(message);
      setStatus("error");
    }
  }, [update]);

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return {
    status,
    update,
    progress,
    error,
    checkForUpdate,
    installUpdate,
  };
}