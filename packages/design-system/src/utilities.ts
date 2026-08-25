export const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export const statusTone = (status: string): StatusTone => {
  const normalized = status.toLowerCase();
  if (["critical", "offline", "error", "failed", "blocked"].some((value) => normalized.includes(value))) return "danger";
  if (["warning", "paused", "degraded", "pending"].some((value) => normalized.includes(value))) return "warning";
  if (["online", "active", "complete", "healthy", "ready"].some((value) => normalized.includes(value))) return "success";
  if (["info", "running", "processing", "scheduled"].some((value) => normalized.includes(value))) return "info";
  return "neutral";
};

/** Backwards-compatible class helper used by existing plugins. */
export const statusClass = (status: string) => {
  const tone = statusTone(status);
  return cn("status", tone !== "neutral" && `status--${tone}`);
};
