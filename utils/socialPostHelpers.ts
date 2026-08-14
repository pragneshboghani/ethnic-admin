import type { SocialPostStatus } from "@/types";

export const POST_STATUSES: SocialPostStatus[] = [
  "idea",
  "draft",
  "scheduled",
  "published",
  "archived",
];

export const POST_TYPES = [
  "Post",
  "Reel",
  "Story",
  "Carousel",
  "Video",
  "Article",
  "Poll",
];

const STATUS_META: Record<SocialPostStatus, { label: string; className: string }> = {
  idea: { label: "Idea", className: "border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--accent-text)]" },
  draft: { label: "Draft", className: "border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 text-[var(--status-purple-text)]" },
  scheduled: { label: "Scheduled", className: "border-[var(--status-amber-text)]/28 bg-[#f9ab00]/16 text-[var(--status-amber-text)]" },
  published: { label: "Published", className: "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]" },
  archived: { label: "Archived", className: "border-[var(--border)] bg-black/[0.04] text-[var(--text-muted)]" },
};

export const getPostStatusMeta = (status: SocialPostStatus) =>
  STATUS_META[status] || STATUS_META.idea;

export const isOverdue = (status: SocialPostStatus, scheduledAt: string) =>
  status === "scheduled" && new Date(scheduledAt).getTime() < Date.now();

export const toLocalInputValue = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export const formatScheduleLabel = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
