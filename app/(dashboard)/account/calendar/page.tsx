"use client";

import ProjectActions from "@/actions/ProjectActions";
import SocialPostActions from "@/actions/SocialPostActions";
import AuthorActions from "@/actions/AuthorActions";
import AgendaRail from "@/components/calendar/AgendaRail";
import CalendarBoard from "@/components/calendar/CalendarBoard";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import PostDetailModal from "@/components/calendar/PostDetailModal";
import PostFormModal from "@/components/calendar/PostFormModal";
import { CalendarDays, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type {
  Authors,
  CalendarEvent,
  CalendarFilterState,
  Project,
  ProjectSocialAccount,
  SocialPost,
} from "@/types";
import { toLocalInputValue } from "@/utils/socialPostHelpers";

const CalendarPage = () => {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [authors, setAuthors] = useState<Authors[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [filters, setFilters] = useState<CalendarFilterState>({
    projectId: null,
    status: "all",
    accountId: null,
    includeBlogs: true,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [detailPost, setDetailPost] = useState<SocialPost | null>(null);
  const [formDate, setFormDate] = useState(() => toLocalInputValue(new Date()));
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasAccess(AuthorActions.canAccessCalendar()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasAccess !== true) return;

    const loadReferenceData = async () => {
      try {
        const [projectResponse, authorResponse] = await Promise.all([
          ProjectActions.getAllProjects(),
          AuthorActions.getAllAuthors(),
        ]);

        setProjects(projectResponse.data || []);
        setAuthors(authorResponse.data || []);
      } catch (error) {
        console.error("Error loading calendar reference data:", error);
        toast.error("Failed to load projects 😢");
      }
    };

    loadReferenceData();
  }, [hasAccess]);

  const fetchCalendar = useCallback(async () => {
    if (hasAccess !== true) return;
    if (!range) return;

    try {
      setLoading(true);
      const response = await SocialPostActions.getCalendar({
        from: range.from,
        to: range.to,
        projectId: filters.projectId,
        status: filters.status,
        accountId: filters.accountId,
        includeBlogs: filters.includeBlogs,
      });

      setEvents(response.data || []);
    } catch (error) {
      console.error("Error loading calendar:", error);
      toast.error("Failed to load the calendar 😢");
    } finally {
      setLoading(false);
    }
  }, [range, filters, hasAccess]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const filterAccounts: ProjectSocialAccount[] = useMemo(() => {
    if (!filters.projectId) return [];

    return projects.find((project) => project.id === filters.projectId)?.accounts || [];
  }, [projects, filters.projectId]);

  const socialCount = events.filter((event) => event.source === "social").length;
  const blogCount = events.length - socialCount;

  const openPostDetail = async (postId: number) => {
    try {
      const response = await SocialPostActions.getById(postId);
      setDetailPost(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open post 😢");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.source === "blog") {
      router.push(`/account/blogs/add?id=${event.id}`);
      return;
    }

    openPostDetail(event.id);
  };

  const handleReschedule = async (postId: number, scheduledAt: string) => {
    try {
      await SocialPostActions.reschedule(postId, scheduledAt);
      toast.success("Post rescheduled 🗓️");
      fetchCalendar();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reschedule 😢");
      return false;
    }
  };

  const openCreateForm = (date: string) => {
    setEditingPost(null);
    setFormDate(date);
    setIsFormOpen(true);
  };

  if (hasAccess === false) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          You don&apos;t have access to the Content Calendar feature. Ask an admin to enable it for your account.
        </p>
      </div>
    );
  }

  if (hasAccess === null) {
    return null;
  }

  if (!projects.length) {
    return (
      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] p-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-selected)]">
          <CalendarDays size={22} className="text-[var(--accent)]" />
        </span>
        <p className="mt-4 text-lg font-medium text-[var(--text-strong)]">No projects yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
          A calendar belongs to a project. Create one on the{" "}
          <Link href="/account/projects" className="font-medium text-[var(--accent)] hover:underline">
            Projects page
          </Link>{" "}
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CalendarFilters
        projects={projects}
        accounts={filterAccounts}
        filters={filters}
        onChange={setFilters}
        socialCount={socialCount}
        blogCount={blogCount}
        onCreate={() => openCreateForm(toLocalInputValue(new Date()))}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-w-0">
          {loading && (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <LoaderCircle className="h-3 w-3 animate-spin" /> Loading
            </div>
          )}

          <CalendarBoard
            events={events}
            onRangeChange={(from, to) => setRange({ from, to })}
            onSelectEvent={handleSelectEvent}
            onCreateAt={openCreateForm}
            onReschedule={handleReschedule}
          />
        </div>

        <AgendaRail events={events} onSelectEvent={handleSelectEvent} />
      </div>

      <PostFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPost(null);
        }}
        onSaved={fetchCalendar}
        projects={projects}
        authors={authors}
        defaultProjectId={filters.projectId ?? projects[0]?.id ?? null}
        defaultDate={formDate}
        post={editingPost}
      />

      {detailPost && (
        <PostDetailModal
          post={detailPost}
          onClose={() => setDetailPost(null)}
          onEdit={() => {
            setEditingPost(detailPost);
            setFormDate(detailPost.scheduled_at);
            setDetailPost(null);
            setIsFormOpen(true);
          }}
          onChanged={fetchCalendar}
        />
      )}
    </div>
  );
};

export default CalendarPage;
