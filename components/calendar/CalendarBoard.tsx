"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventContentArg, EventDropArg } from "@fullcalendar/core";
import { FileText, Image as ImageIcon, TriangleAlert } from "lucide-react";
import { useRef } from "react";
import type { CalendarEvent, SocialCalendarEvent } from "@/types";
import { isOverdue, toLocalInputValue } from "@/utils/socialPostHelpers";

type CalendarBoardProps = {
  events: CalendarEvent[];
  onRangeChange: (from: string, to: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateAt: (date: string) => void;
  onReschedule: (postId: number, scheduledAt: string) => Promise<boolean>;
};

const renderEventContent = (arg: EventContentArg) => {
  const event = arg.event.extendedProps.calendarEvent as CalendarEvent;

  if (event.source === "blog") {
    return (
      <div className="flex items-center gap-1.5 overflow-hidden rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-surface-alt)] px-1.5 py-1 transition hover:border-[var(--border-strong)]">
        <FileText size={10} className="shrink-0 text-[var(--text-faint)]" />
        <span className="truncate text-[11px] text-[var(--text-muted)]">{event.title}</span>
      </div>
    );
  }

  const overdue = isOverdue(event.status, event.start);
  const accent = event.projectColor || "#1a73e8";

  return (
    <div
      className={`flex flex-col gap-1 overflow-hidden rounded-md border px-1.5 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition ${
        overdue
          ? "border-[var(--status-amber-text)]/35 bg-[var(--status-amber-bg)] hover:border-[var(--status-amber-text)]"
          : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] hover:shadow-[0_2px_6px_rgba(26,115,232,0.14)]"
      }`}
      style={{ borderLeft: `3px solid ${overdue ? "#f9ab00" : accent}` }}
    >
      <span className="flex items-center gap-1">
        {overdue && <TriangleAlert size={9} className="shrink-0 text-[var(--status-amber-text)]" />}
        <span
          className={`truncate text-[11px] font-medium ${overdue ? "text-[var(--status-amber-text)]" : "text-[var(--text-strong)]"}`}
        >
          {event.title}
        </span>
      </span>

      {(event.accounts.length > 0 || event.mediaCount > 0) && (
        <span className="flex items-center gap-1">
          {event.accounts.slice(0, 4).map((account) => (
            <span
              key={account.id}
              title={`${account.channel_name} — ${account.account_name}`}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: account.channel_color || "#9aa0a6" }}
            />
          ))}
          {event.accounts.length > 4 && (
            <span className="text-[9px] text-[var(--text-faint)]">+{event.accounts.length - 4}</span>
          )}
          {event.mediaCount > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-[9px] text-[var(--text-faint)]">
              <ImageIcon size={9} />
              {event.mediaCount}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

const CalendarBoard = ({
  events,
  onRangeChange,
  onSelectEvent,
  onCreateAt,
  onReschedule,
}: CalendarBoardProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);

  const fcEvents = events.map((event) => ({
    id: `${event.source}-${event.id}`,
    title: event.title,
    start: event.start,
    editable: event.editable,
    extendedProps: { calendarEvent: event },
  }));

  const handleDatesSet = (arg: DatesSetArg) => {
    onRangeChange(toLocalInputValue(arg.start), toLocalInputValue(arg.end));
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const event = arg.event.extendedProps.calendarEvent as CalendarEvent;

    if (event.source !== "social" || !arg.event.start) {
      arg.revert();
      return;
    }

    const succeeded = await onReschedule(
      (event as SocialCalendarEvent).id,
      toLocalInputValue(arg.event.start),
    );

    if (!succeeded) {
      arg.revert();
    }
  };

  return (
    <div className="content-calendar overflow-x-auto rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-4">
      <div className="min-w-[680px]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          buttonText={{ today: "Today", month: "Month", week: "Week", list: "List" }}
          height="auto"
          firstDay={1}
          dayMaxEvents={3}
          nowIndicator
          editable
          eventStartEditable
          eventDurationEditable={false}
          events={fcEvents}
          eventContent={renderEventContent}
          datesSet={handleDatesSet}
          eventDrop={handleEventDrop}
          eventClick={(arg) => onSelectEvent(arg.event.extendedProps.calendarEvent as CalendarEvent)}
          dateClick={(arg) => onCreateAt(`${arg.dateStr.slice(0, 10)}T10:00`)}
        />
      </div>
    </div>
  );
};

export default CalendarBoard;
