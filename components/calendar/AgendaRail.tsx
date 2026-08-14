"use client";

import { CalendarDays, FileText, Image as ImageIcon, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import type { CalendarEvent, SocialCalendarEvent } from "@/types";
import { getPostStatusMeta, isOverdue } from "@/utils/socialPostHelpers";

type AgendaRailProps = {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
};

const startOfDay = (value: string | Date) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayLabel = (date: Date) => {
  const today = startOfDay(new Date());
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const AgendaRail = ({ events, onSelectEvent }: AgendaRailProps) => {
  const { groups, overdue } = useMemo(() => {
    const today = startOfDay(new Date()).getTime();

    const overdueItems = events.filter(
      (e): e is SocialCalendarEvent => e.source === "social" && isOverdue(e.status, e.start),
    );

    const upcoming = events
      .filter((e) => startOfDay(e.start).getTime() >= today)
      .filter((e) => !(e.source === "social" && isOverdue(e.status, e.start)))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const byDay = new Map<number, CalendarEvent[]>();

    for (const event of upcoming) {
      const key = startOfDay(event.start).getTime();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(event);
    }

    return {
      overdue: overdueItems,
      groups: [...byDay.entries()].slice(0, 8).map(([key, items]) => ({
        key,
        date: new Date(key),
        items,
      })),
    };
  }, [events]);

  const Row = ({ event }: { event: CalendarEvent }) => {
    if (event.source === "blog") {
      return (
        <button
          type="button"
          onClick={() => onSelectEvent(event)}
          className="flex w-full items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface-alt)] px-3 py-2.5 text-left transition hover:border-[var(--border-strong)]"
        >
          <FileText size={14} className="mt-0.5 shrink-0 text-[var(--text-faint)]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-[var(--text)]">{event.title}</span>
            <span className="mt-0.5 block text-xs text-[var(--text-faint)]">
              Blog · {timeLabel(event.start)}
            </span>
          </span>
        </button>
      );
    }

    const status = getPostStatusMeta(event.status);

    return (
      <button
        type="button"
        onClick={() => onSelectEvent(event)}
        className="flex w-full gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-[var(--accent)] hover:shadow-[0_2px_8px_rgba(26,115,232,0.12)]"
      >
        <span
          className="mt-0.5 w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: event.projectColor || "#1a73e8" }}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-[var(--text-strong)]">{event.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
              {timeLabel(event.start)}
            </span>
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.className}`}
            >
              {status.label}
            </span>

            {event.accounts.slice(0, 4).map((account) => (
              <span
                key={account.id}
                title={`${account.channel_name} — ${account.account_name}`}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: account.channel_color || "#9aa0a6" }}
              />
            ))}
            {event.accounts.length > 4 && (
              <span className="text-[10px] text-[var(--text-faint)]">+{event.accounts.length - 4}</span>
            )}

            {event.mediaCount > 0 && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--text-faint)]">
                <ImageIcon size={10} />
                {event.mediaCount}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  return (
    <aside className="flex flex-col gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
          <CalendarDays size={15} className="text-[var(--accent)]" />
          Up next
        </h2>
        <span className="rounded-full bg-[var(--bg-inset)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">
          {groups.reduce((n, g) => n + g.items.length, 0)}
        </span>
      </div>

      {overdue.length > 0 && (
        <div className="rounded-xl border border-[var(--status-amber-text)]/35 bg-[var(--status-amber-bg)] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-[var(--status-amber-text)]">
            <TriangleAlert size={13} />
            {overdue.length} overdue
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {overdue.slice(0, 3).map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="truncate text-left text-xs text-[var(--status-amber-text)] underline decoration-[var(--status-amber-text)]/40 underline-offset-2 hover:decoration-[var(--status-amber-text)]"
              >
                {event.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-8 text-center text-xs leading-5 text-[var(--text-faint)]">
          Nothing scheduled ahead.
          <br />
          Click a day to plan a post.
        </p>
      ) : (
        <div className="flex max-h-[560px] flex-col gap-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                {dayLabel(group.date)}
              </p>
              <div className="flex flex-col gap-2">
                {group.items.map((event) => (
                  <Row key={`${event.source}-${event.id}`} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default AgendaRail;
