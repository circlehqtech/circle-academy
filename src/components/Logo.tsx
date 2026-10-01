interface LogoIconProps {
  className?: string;
  alt?: string;
}

export function LogoIcon({
  className = "size-8",
  alt = "Circle HQ Emblem",
}: LogoIconProps) {
  return (
    <img
      src="/circle_logo.png"
      alt={alt}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

interface LogoProps {
  theme?: "light" | "dark" | "auto";
  isLightPage?: boolean;
  showTagline?: boolean;
  tagline?: string;
  subtitle?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  theme = "auto",
  isLightPage = false,
  showTagline = false,
  tagline = "Well rounded results",
  subtitle,
  className = "",
  size = "md",
}: LogoProps) {
  const isDarkText = theme === "light" || (theme === "auto" && isLightPage);
  const textColor = theme === "dark" ? "text-white" : isDarkText ? "text-black" : "text-foreground";

  const iconSizes = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon className={iconSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight leading-none ${textSizes[size]}`}>
            <span className="text-[#FF0000]">Circle</span>
            <span className={textColor}>hq</span>
          </span>
          {subtitle ? (
            <span className="rounded-full bg-surface-2/80 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-muted">
              {subtitle}
            </span>
          ) : null}
        </div>
        {showTagline ? (
          <span className="mt-1 text-[10px] font-normal tracking-tight text-muted">
            {tagline}
          </span>
        ) : null}
      </div>
    </div>
  );
}
