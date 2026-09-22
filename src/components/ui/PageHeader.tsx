import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { button } from "../../styles";

interface PageHeaderProps {
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}

export function PageHeader({
  description,
  actionLabel,
  actionIcon,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <p className="max-w-[68ch] text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button className={button} type="button" onClick={onAction}>
          {actionIcon ?? <Icon name="plus" />}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
