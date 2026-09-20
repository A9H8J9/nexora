import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {
        // Ignore when running outside Tauri
      }
    };

    checkMaximized();

    const handleResize = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {
        // Ignore
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [appWindow]);

  const minimize = async () => {
    try {
      await appWindow.minimize();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  };

  const toggleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
      setIsMaximized(await appWindow.isMaximized());
    } catch (error) {
      console.error("Failed to toggle maximize:", error);
    }
  };

  const close = async () => {
    try {
      await appWindow.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="
        relative
        flex
        h-[42px]
        w-full
        shrink-0
        select-none
        items-center
        border-b
        border-neutral-200
        bg-white
        text-[#111111]
      "
    >
      {/* Brand */}
      <div
        data-tauri-drag-region
        className="
          flex
          h-full
          items-center
          
          px-4
        "
      >
        <img src="../../src-tauri/icons/32x32.png" />

        <span
          className="
            text-[13px]
            font-medium
            tracking-[0.01em]
            text-neutral-800
          "
        >
          Nexora
        </span>
      </div>

      {/* Window Controls */}
      <div
        className="
          absolute
          right-0
          top-0
          flex
          h-[42px]
          items-center
        "
      >
        {/* Minimize */}
        <button
          type="button"
          aria-label="Minimize"
          onClick={minimize}
          className="
            group
            flex
            h-[42px]
            w-[48px]
            items-center
            justify-center
            text-neutral-500
            outline-none
            transition-colors
            duration-150
            hover:bg-neutral-100
            hover:text-black
            focus-visible:bg-neutral-100
          "
        >
          <Minus
            size={15}
            strokeWidth={1.7}
            className="transition-transform duration-150 group-hover:scale-105"
          />
        </button>

        {/* Maximize / Restore */}
        <button
          type="button"
          aria-label={isMaximized ? "Restore" : "Maximize"}
          onClick={toggleMaximize}
          className="
            group
            flex
            h-[42px]
            w-[48px]
            items-center
            justify-center
            text-neutral-500
            outline-none
            transition-colors
            duration-150
            hover:bg-neutral-100
            hover:text-black
            focus-visible:bg-neutral-100
          "
        >
          {isMaximized ? (
            <Copy
              size={13}
              strokeWidth={1.65}
              className="transition-transform duration-150 group-hover:scale-105"
            />
          ) : (
            <Square
              size={13}
              strokeWidth={1.65}
              className="transition-transform duration-150 group-hover:scale-105"
            />
          )}
        </button>

        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="
            group
            flex
            h-[42px]
            w-[48px]
            items-center
            justify-center
            text-neutral-500
            outline-none
            transition-colors
            duration-150
            hover:bg-[#c94f4f]
            hover:text-white
            focus-visible:bg-[#c94f4f]
            focus-visible:text-white
          "
        >
          <X
            size={16}
            strokeWidth={1.7}
            className="transition-transform duration-150 group-hover:scale-105"
          />
        </button>
      </div>
    </div>
  );
}
