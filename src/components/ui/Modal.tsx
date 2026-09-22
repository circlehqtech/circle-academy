import { useId, type ReactNode } from "react";
import { Icon } from "../Icon";

interface ModalProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function Modal({ children, title, subtitle, onClose }: ModalProps) {
  const titleId = useId();

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="my-8 w-full max-w-[620px] rounded-[22px] bg-background p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-[700]">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button
            className="grid size-9 place-items-center rounded-full hover:bg-surface-2"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
