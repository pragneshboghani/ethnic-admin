"use client";

import ProjectActions from "@/actions/ProjectActions";
import SocialChannelActions from "@/actions/SocialChannelActions";
import PlateFormActions from "@/actions/PlateFormActions";
import AuthorActions from "@/actions/AuthorActions";
import ProjectFormModal from "@/components/project/ProjectFormModal";
import SocialAccountsPanel from "@/components/project/SocialAccountsPanel";
import ClickOutside from "@/components/common/ClickOutside";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Platform, Project, Role, SocialChannel } from "@/types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const canManage = currentRole === "super_admin" || currentRole === "admin";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentRole((AuthorActions.getCurrentUserRole()?.role as Role) || null);
      setHasAccess(AuthorActions.canAccessCalendar());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProjectActions.getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects 😢");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [channelResponse, platformResponse] = await Promise.all([
          SocialChannelActions.getAllChannels(),
          PlateFormActions.getAllPlateform(),
        ]);

        setChannels(channelResponse.data || []);
        setPlatforms(platformResponse.data || []);
      } catch (error) {
        console.error("Error loading reference data:", error);
      }
    };

    loadReferenceData();
  }, []);

  const handleDelete = async () => {
    if (!deleteProject) return;

    try {
      const response = await ProjectActions.deleteProject(deleteProject.id);
      toast.success(response.message || "Project deleted 🗑️");
      setDeleteProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project 😢");
      setDeleteProject(null);
    }
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

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
          >
            <Plus size={16} /> Add Project
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)]">
          <LoaderCircle className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <p className="text-lg font-medium text-[var(--text-strong)]">No projects yet</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Add a brand like Ethnic Infotech or Statixoup, connect its social accounts, then start
            planning on the{" "}
            <Link href="/account/calendar" className="text-[var(--accent)] underline">
              content calendar
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <section
              key={project.id}
              className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text-strong)]">
                      {project.name}
                    </h2>
                    {project.description && (
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{project.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1">
                        {project.account_count ?? 0} accounts
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1">
                        {project.post_count ?? 0} posts
                      </span>
                      {project.status === "archived" && (
                        <span className="rounded-full border border-[var(--border)] bg-black/[0.04] px-3 py-1">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent)]/24 bg-[var(--accent)]/14 text-[var(--accent-text)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/22"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteProject(project)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--status-amber-text)]/24 bg-[#f9ab00]/14 text-[var(--status-amber-text)] transition hover:border-[var(--status-amber-text)]/40 hover:bg-[#f9ab00]/22"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <SocialAccountsPanel
                project={project}
                channels={channels}
                canManage={canManage}
                onChanged={fetchProjects}
              />
            </section>
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchProjects}
        project={editingProject}
        platforms={platforms}
      />

      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
          <ClickOutside onClickOutside={() => setDeleteProject(null)}>
            <div className="w-full max-w-md rounded-[26px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">Delete project</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                This removes <span className="text-[var(--text-strong)]">{deleteProject.name}</span> and its
                social accounts. Projects that already have calendar posts must be archived instead.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteProject(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl border border-[var(--status-amber-text)]/40 bg-[var(--status-red-bg)] px-4 py-2 text-sm font-medium text-[var(--status-amber-text)] transition hover:bg-[var(--status-red-bg)]"
                >
                  Delete
                </button>
              </div>
            </div>
          </ClickOutside>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
