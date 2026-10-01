import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

interface SelectOptionProps {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
}

interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
}

export interface CustomSelectChangeEvent {
  target: {
    value: string;
    selectedOptions: Array<{ value: string }>;
  };
}

interface CustomSelectProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string | number | readonly string[];
  disabled?: boolean;
  id?: string;
  multiple?: boolean;
  name?: string;
  onChange?: (event: CustomSelectChangeEvent) => void;
  placeholder?: string;
  required?: boolean;
  size?: number;
  value?: string | number | readonly string[];
  "aria-label"?: string;
}

function optionLabel(children: ReactNode) {
  return Children.toArray(children)
    .map((child) => typeof child === "string" || typeof child === "number" ? String(child) : "")
    .join("")
    .trim();
}

function getOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<SelectOptionProps>(child) || child.type !== "option") return [];
    const label = optionLabel(child.props.children);
    return [{ value: String(child.props.value ?? label), label, disabled: Boolean(child.props.disabled) }];
  });
}

function normalizeValue(value: CustomSelectProps["value"] | CustomSelectProps["defaultValue"], multiple: boolean) {
  if (multiple) return Array.isArray(value) ? value.map(String) : value == null ? [] : [String(value)];
  return Array.isArray(value) ? String(value[0] ?? "") : value == null ? "" : String(value);
}

export function CustomSelect({
  children,
  className = "",
  defaultValue,
  disabled = false,
  id,
  multiple = false,
  name,
  onChange,
  placeholder = "Select an option",
  required = false,
  value,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const options = useMemo(() => getOptions(children), [children]);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | string[]>(() => {
    const initial = normalizeValue(defaultValue, multiple);
    if (multiple || initial) return initial;
    return options[0]?.value ?? "";
  });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = normalizeValue(controlled ? value : internalValue, multiple);
  const selectedValues = Array.isArray(selected) ? selected : [selected];
  const selectedLabels = options.filter((option) => selectedValues.includes(option.value)).map((option) => option.label);
  const displayValue = selectedLabels.length ? selectedLabels.join(", ") : placeholder;
  const sizingClasses = className.match(/(?:^|\s)(?:w-(?:auto|full)|min-w-\[[^\]]+\]|max-w-\[[^\]]+\])/g)?.join(" ") ?? "w-full";

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const commit = (nextValues: string[]) => {
    const next = multiple ? nextValues : nextValues[0] ?? "";
    if (!controlled) setInternalValue(next);
    onChange?.({ target: { value: nextValues[0] ?? "", selectedOptions: nextValues.map((optionValue) => ({ value: optionValue })) } });
    if (!multiple) setOpen(false);
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    if (!multiple) { commit([option.value]); return; }
    commit(selectedValues.includes(option.value) ? selectedValues.filter((item) => item !== option.value) : [...selectedValues, option.value]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[activeIndex]) choose(options[activeIndex]); else setOpen(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => (current + direction + options.length) % options.length);
  };

  return (
    <div ref={rootRef} className={`relative ${sizingClasses}`}>
      {name ? selectedValues.map((selectedValue) => <input key={selectedValue || "empty"} type="hidden" name={name} value={selectedValue} />) : null}
      <button
        id={id}
        type="button"
        className={`flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] border-[1.5px] border-line bg-surface px-4 py-3 text-left text-foreground outline-none transition-[border-color,box-shadow,background] duration-200 hover:border-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 ${className.includes("text-xs") ? "text-xs" : ""}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedLabels.length ? "" : "text-muted"}`}>{displayValue}</span>
        {multiple && selectedLabels.length > 1 ? <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface-2))] px-2 py-0.5 text-[11px] font-bold text-accent-text">{selectedLabels.length}</span> : null}
        <ChevronDownIcon className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180 text-accent-text" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          className="absolute z-[80] mt-2 max-h-72 w-full min-w-max overflow-y-auto rounded-[16px] border border-line bg-surface p-1.5 shadow-[0_22px_55px_-24px_rgb(0_0_0/0.55)] [scrollbar-width:thin]"
        >
          {options.map((option, index) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-[11px] px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${index === activeIndex ? "bg-surface-2" : "hover:bg-surface-2"} ${isSelected ? "font-semibold text-accent-text" : "text-foreground"}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                <span className={`grid size-5 place-items-center rounded-full ${isSelected ? "bg-accent text-white" : "border border-line"}`}>
                  {isSelected ? <CheckIcon className="size-3.5 stroke-[2.5]" aria-hidden="true" /> : null}
                </span>
              </button>
            );
          })}
          {options.length === 0 ? <p className="px-3 py-2.5 text-sm text-muted">No options available</p> : null}
        </div>
      ) : null}
      {required && !selectedValues.filter(Boolean).length ? <input className="sr-only" tabIndex={-1} required value="" onChange={() => undefined} aria-hidden="true" /> : null}
    </div>
  );
}
