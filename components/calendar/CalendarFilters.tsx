"use client";

import { FileText, Plus, Sparkles } from "lucide-react";
import type { CalendarFilterState, Project, ProjectSocialAccount, SocialPostStatus } from "@/types";
import { getPostStatusMeta, POST_STATUSES } from "@/utils/socialPostHelpers";

type CalendarFiltersProps = {
  projects: Project[];
  accounts: ProjectSocialAccount[];
  filters: CalendarFilterState;
  onChange: (next: CalendarFilterState) => void;
  socialCount: number;
  blogCount: number;
  onCreate: () => void;
};

const selectClass =
  "h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-strong)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 disabled:bg-[var(--bg-inset)] disabled:text-[var(--text-faint)]";

const CalendarFilters = ({
  projects,
  accounts,
  filters,
  onChange,
  socialCount,
  blogCount,
  onCreate,
}: CalendarFiltersProps) => {
  const activeProject = projects.find((p) => p.id === filters.projectId);

  return (
    <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-3">
        {activeProject && (
          <span
            className="h-6 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: activeProject.color }}
          />
        )}

        <select
          aria-label="Project"
          className={selectClass}
          value={filters.projectId ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              projectId: e.target.value ? Number(e.target.value) : null,
              accountId: null,
            })
          }
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Social account"
          className={selectClass}
          value={filters.accountId ?? ""}
          disabled={!accounts.length}
          onChange={(e) =>
            onChange({ ...filters, accountId: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.channel_name} — {account.account_name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange({ ...filters, includeBlogs: !filters.includeBlogs })}
          aria-pressed={filters.includeBlogs}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition ${
            filters.includeBlogs
              ? "border-[var(--accent)] bg-[var(--bg-selected)] text-[var(--accent-hover)]"
              : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
          }`}
        >
          <FileText size={14} />
          Blogs
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex">
            <Sparkles size={13} className="text-[var(--accent)]" />
            {socialCount} posts
            {filters.includeBlogs && <span className="text-[var(--text-faint)]">· {blogCount} blogs</span>}
          </span>

          <button
            type="button"
            onClick={onCreate}
            disabled={!projects.length}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> New post
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--border)] pt-3">
        {(["all", ...POST_STATUSES] as (SocialPostStatus | "all")[]).map((status) => {
          const active = filters.status === status;
          const label = status === "all" ? "All" : getPostStatusMeta(status).label;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ ...filters, status })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-inset)] hover:text-[var(--text-strong)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CalendarFilters;
