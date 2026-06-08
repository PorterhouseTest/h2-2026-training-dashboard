export const RACE_DATE = new Date("2026-10-17T12:00:00.000Z");

export function parseInputDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") throw new Error("Date is required.");
  return new Date(`${value}T12:00:00.000Z`);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function startOfSundayWeek(date: Date) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
  copy.setUTCDate(copy.getUTCDate() - copy.getUTCDay());
  return copy;
}

export function secondsToPace(seconds?: number | null) {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}/mi`;
}

export function secondsToTime(seconds?: number | null) {
  if (!seconds) return "Not enough data yet";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
