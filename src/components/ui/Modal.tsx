import { useEffect, useId, type ReactNode } from "react";
import { Icon } from "../Icon";

interface ModalProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  size?: "compact" | "default" | "wide" | "drawer";
  busy?: boolean;
}

const panelSizes = {
  compact: "max-h-[calc(100dvh-1rem)] max-w-[min(480px,calc(100vw-1rem))] sm:max-h-[calc(100dvh-2rem)] sm:max-w-[min(480px,calc(100vw-2rem))]",
  default: "h-[calc(100dvh-1rem)] max-w-[min(620px,calc(100vw-1rem))] sm:h-[min(720px,calc(100dvh-2rem))] sm:max-w-[min(620px,calc(100vw-2rem))]",
  wide: "h-[calc(100dvh-1rem)] max-w-[min(820px,calc(100vw-1rem))] sm:h-[min(780px,calc(100dvh-2rem))] sm:max-w-[min(820px,calc(100vw-2rem))]",
  drawer: "h-dvh max-w-[min(920px,100vw)] rounded-none sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[22px]",
} as const;

export function Modal({ children, title, subtitle, onClose, size = "default", busy = false }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [busy, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black/45 ${size === "drawer" ? "flex justify-end" : "grid place-items-center p-2 sm:p-4"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy={busy}
    >
      <div className={`flex min-h-0 w-full flex-col overflow-hidden rounded-[22px] bg-background shadow-2xl ${panelSizes[size]}`}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 id={titleId} className="text-2xl font-[700]">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button
            className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
