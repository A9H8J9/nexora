import type { ElementType, ReactNode } from "react";

interface PageHeaderProps {
  icon: ElementType;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

/**
 * Shared page header used across every page so the app frame
 * (icon tile, title, subtitle and actions) stays identical everywhere.
 */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <header className="shrink-0 border-b border-neutral-200 bg-white">
      <div className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            <Icon size={18} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-black">
              {title}
            </h1>

            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {subtitle}
            </p>
          </div>
        </div>

        {actions && (
          <div className="ml-4 flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
