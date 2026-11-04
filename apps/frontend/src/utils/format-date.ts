/** "2026-10-14T09:10:28Z" -> "14 Oct, 2:40 pm" in the viewer's locale. */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

/** "just now", "5m ago", "3h ago", "2d ago", else the short date. */
export function formatRelative(isoTimestamp: string): string {
  const timestampMilliseconds = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timestampMilliseconds)) return "";
  const minutesAgo = Math.round((Date.now() - timestampMilliseconds) / MILLISECONDS_PER_MINUTE);
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < MINUTES_PER_HOUR) return `${minutesAgo}m ago`;
  if (minutesAgo < MINUTES_PER_DAY) return `${Math.round(minutesAgo / MINUTES_PER_HOUR)}h ago`;
  if (minutesAgo < MINUTES_PER_DAY * 7) return `${Math.round(minutesAgo / MINUTES_PER_DAY)}d ago`;
  return new Date(isoTimestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
