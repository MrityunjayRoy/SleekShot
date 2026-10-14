export function fmtDuration(iso: string): string {
  const [, h, m, s] = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
  const pad = (n: string | undefined) => String(n || 0).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m || 0}:${pad(s)}`;
}

export const fmtViews = (n: number | string) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(n)) + " views";

export function timeAgo(iso: string): string {
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  const units: Array<[number, string]> = [
    [525600, "year"],
    [43200, "month"],
    [10080, "week"],
    [1440, "day"],
    [60, "hour"],
    [1, "minute"],
  ];
  for (const [m, name] of units) {
    if (mins >= m) {
      const n = Math.floor(mins / m);
      return `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

/** Compact number formatting that falls back to the raw string. */
export function fmt(n: unknown): string {
  const x = Number(n);
  return Number.isFinite(x) && n !== null && n !== undefined && String(n).trim() !== ""
    ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(x)
    : String(n ?? "");
}

/** "2024-03-05" -> "Mar 2024" */
export function month(iso?: string): string {
  return iso
    ? new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric" })
    : "";
}

/** Tweet timestamp split into X-style date and time, in the viewer's timezone. */
export function tweetDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso || "", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}