/** Formats a number of seconds as m:ss or h:mm:ss. */
export function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const c = s % 60;
  const head = h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`;
  return `${head}:${String(c).padStart(2, '0')}`;
}