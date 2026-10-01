export const APP_TIME_ZONE = "Africa/Lagos";

const DATE_LOCALE = "en-GB";

function parsedDate(value: unknown): Date | null {
  if (!value || value === "—") return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: unknown): string {
  const date = parsedDate(value);
  if (!date) return value ? String(value) : "—";
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: unknown): string {
  const date = parsedDate(value);
  if (!date) return value ? String(value) : "—";
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatClockTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function zonedParts(value: unknown): Record<string, string> {
  const date = parsedDate(value);
  if (!date) return {};
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: APP_TIME_ZONE,
  }).formatToParts(date).map((part) => [part.type, part.value]));
}

export function toDateInputValue(value: unknown): string {
  const parts = zonedParts(value);
  return parts.year ? `${parts.year}-${parts.month}-${parts.day}` : "";
}

export function toTimeInputValue(value: unknown): string {
  const parts = zonedParts(value);
  return parts.hour ? `${parts.hour}:${parts.minute}` : "";
}

export function toDateTimeLocalValue(value: unknown): string {
  const date = toDateInputValue(value);
  const time = toTimeInputValue(value);
  return date && time ? `${date}T${time}` : "";
}
