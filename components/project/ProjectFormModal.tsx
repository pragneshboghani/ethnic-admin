"use client";

import ClickOutside from "@/components/common/ClickOutside";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProjectActions from "@/actions/ProjectActions";
import type { Platform, Project } from "@/types";

type ProjectFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  project: Project | null;
  platforms: Platform[];
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";
const labelClass = "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";

const COLOR_CHOICES = ["#1a73e8", "#1e8e3e", "#e37400", "#a142f4", "#00838f", "#d93025"];

const ProjectFormModal = ({
  isOpen,
  onClose,
  onSaved,
  project,
  platforms,
}: ProjectFormModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [platformIds, setPlatformIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setName(project?.name || "");
    setDescription(project?.description || "");
    setWebsiteUrl(project?.website_url || "");
    setColor(project?.color || COLOR_CHOICES[0]);
    setStatus(project?.status || "active");
    setPlatformIds(project?.platform_ids || []);
  }, [isOpen, project]);

  if (!isOpen) return null;

  const togglePlatform = (platformId: number) => {
    setPlatformIds((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please add a project name 😢");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description,
        website_url: websiteUrl,
        color,
        status,
        platform_ids: platformIds,
      };

      const response = project
        ? await ProjectActions.updateProject(project.id, payload)
        : await ProjectActions.addProject(payload);

      toast.success(response.message || "Project saved successfully 🎉");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save project 😢");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
      <ClickOutside onClickOutside={onClose}>
        <div className="modal-scroll max-h-[90vh] w-[620px] max-w-[92vw] overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-[var(--text-strong)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-subtle)]">
                {project ? "Edit" : "New"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
                {project ? "Edit project" : "Add a project"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Name</label>
              <input
                className={inputClass}
                placeholder="Ethnic Infotech"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                className={inputClass}
                placeholder="What this brand is about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Website</label>
                <input
                  className={inputClass}
                  placeholder="https://"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "archived")}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Calendar colour</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setColor(choice)}
                    className={`h-9 w-9 rounded-xl border-2 transition ${
                      color === choice
                        ? "border-[var(--text-strong)] ring-2 ring-[var(--accent)]/30"
                        : "border-[var(--border)] hover:border-[var(--text-faint)]"
                    }`}
                    style={{ backgroundColor: choice }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Linked blog platforms</label>
              <p className="text-xs text-[var(--text-muted)]">
                Scheduled blogs on these platforms show up on this project&apos;s calendar.
              </p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const selected = platformIds.includes(platform.id!);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id!)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selected
                          ? "border-[var(--border-strong)] bg-[var(--bg-selected)] text-[var(--text-strong)]"
                          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                      }`}
                    >
                      {platform.platform_name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition hover:bg-black/[0.04]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {project ? "Save changes" : "Create project"}
            </button>
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default ProjectFormModal;
