import { Icon, type IconName } from "../Icon";
import { buttonGhostSmall } from "../../styles";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, compact = false, className = "" }: EmptyStateProps) {
  return (
    <div className={`grid place-items-center rounded-[18px] border border-dashed border-line bg-surface text-center ${compact ? "min-h-40 p-5" : "min-h-56 p-7"} ${className}`}>
      <div className="grid max-w-md justify-items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-surface-2" aria-hidden="true">
          <Icon name={icon} className="size-5 text-muted" />
        </span>
        <div>
          <h2 className="text-base font-[650]">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <button className={buttonGhostSmall} type="button" onClick={onAction}>
            <Icon name="plus" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
