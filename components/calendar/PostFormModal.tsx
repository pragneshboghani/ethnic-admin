"use client";

import ClickOutside from "@/components/common/ClickOutside";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import { Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SocialPostActions from "@/actions/SocialPostActions";
import ProjectActions from "@/actions/ProjectActions";
import type {
  Authors,
  Project,
  ProjectSocialAccount,
  SocialPost,
  SocialPostMedia,
  SocialPostStatus,
} from "@/types";
import { getPostStatusMeta, POST_STATUSES, POST_TYPES } from "@/utils/socialPostHelpers";

type PostFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projects: Project[];
  authors: Authors[];
  defaultProjectId: number | null;
  defaultDate: string;
  post: SocialPost | null;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";
const labelClass = "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";

const PostFormModal = ({
  isOpen,
  onClose,
  onSaved,
  projects,
  authors,
  defaultProjectId,
  defaultDate,
  post,
}: PostFormModalProps) => {
  const [projectId, setProjectId] = useState<number | null>(defaultProjectId);
  const [accounts, setAccounts] = useState<ProjectSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [postType, setPostType] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [status, setStatus] = useState<SocialPostStatus>("idea");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [campaign, setCampaign] = useState("");
  const [media, setMedia] = useState<SocialPostMedia[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (post) {
      setProjectId(post.project_id);
      setSelectedAccountIds(post.account_ids);
      setTitle(post.title);
      setCaption(post.caption || "");
      setHashtags(post.hashtags || "");
      setLinkUrl(post.link_url || "");
      setPostType(post.post_type || "");
      setScheduledAt(post.scheduled_at);
      setStatus(post.status);
      setAssignedTo(post.assigned_to);
      setCampaign(post.campaign || "");
      setMedia(post.media);
      setNotes(post.notes || "");
      return;
    }

    setProjectId(defaultProjectId);
    setSelectedAccountIds([]);
    setTitle("");
    setCaption("");
    setHashtags("");
    setLinkUrl("");
    setPostType("");
    setScheduledAt(defaultDate);
    setStatus("idea");
    setAssignedTo(null);
    setCampaign("");
    setMedia([]);
    setNotes("");
  }, [isOpen, post, defaultProjectId, defaultDate]);

  useEffect(() => {
    if (!isOpen || !projectId) {
      setAccounts([]);
      return;
    }

    const loadAccounts = async () => {
      try {
        const response = await ProjectActions.getAccounts(projectId);
        setAccounts(response.data || []);
      } catch (error) {
        console.error("Error loading social accounts:", error);
        setAccounts([]);
      }
    };

    loadAccounts();
  }, [isOpen, projectId]);

  const charLimit = useMemo(() => {
    const limits = accounts
      .filter((a) => selectedAccountIds.includes(a.id))
      .map((a) => a.char_limit)
      .filter((limit): limit is number => typeof limit === "number");

    return limits.length ? Math.min(...limits) : null;
  }, [accounts, selectedAccountIds]);

  if (!isOpen) return null;

  const toggleAccount = (accountId: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId],
    );
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Please choose a project 😢");
      return;
    }

    if (!title.trim()) {
      toast.error("Please add a title 😢");
      return;
    }

    if (!scheduledAt) {
      toast.error("Please pick a date and time 😢");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        project_id: projectId,
        title: title.trim(),
        caption,
        hashtags,
        link_url: linkUrl,
        media,
        post_type: postType,
        account_ids: selectedAccountIds,
        scheduled_at: scheduledAt,
        status,
        assigned_to: assignedTo,
        campaign,
        notes,
      };

      const response = post
        ? await SocialPostActions.updatePost(post.id, payload)
        : await SocialPostActions.addPost(payload);

      toast.success(response.message || "Post saved successfully 🎉");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save post 😢");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
        <ClickOutside onClickOutside={onClose}>
          <div className="modal-scroll max-h-[90vh] w-[820px] max-w-[92vw] overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-[var(--text-strong)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-subtle)]">
                  {post ? "Edit" : "New"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
                  {post ? "Edit post" : "Plan a post"}
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

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Project</label>
                <select
                  className={inputClass}
                  value={projectId ?? ""}
                  onChange={(e) => {
                    setProjectId(e.target.value ? Number(e.target.value) : null);
                    setSelectedAccountIds([]);
                  }}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Scheduled for</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  placeholder="Internal label shown on the calendar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className={labelClass}>Accounts</label>
              {!projectId ? (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  Choose a project to see its social accounts.
                </p>
              ) : !accounts.length ? (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  This project has no social accounts yet. Add them from the Projects page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accounts.map((account) => {
                    const selected = selectedAccountIds.includes(account.id);

                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => toggleAccount(account.id)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${selected
                          ? "border-[var(--border-strong)] bg-[var(--bg-selected)] text-[var(--text-strong)]"
                          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                          }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: account.channel_color || "#8fa0b6" }}
                        />
                        {account.channel_name} — {account.account_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Caption</label>
                {charLimit !== null && (
                  <span
                    className={`text-xs ${caption.length > charLimit ? "text-red-400" : "text-[var(--text-subtle)]"
                      }`}
                  >
                    {caption.length} / {charLimit}
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                className={inputClass}
                placeholder="The copy that goes out with this post"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Creative</label>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)]"
                >
                  <Plus size={14} /> Add media
                </button>
              </div>

              {isMediaModalOpen && (
                <UploadMediaModal
                  isOpen={isMediaModalOpen}
                  onClose={() => setIsMediaModalOpen(false)}
                  allowedMediaType="all"
                  onSelectMedia={(selected) =>
                    setMedia((prev) => [
                      ...prev,
                      {
                        url: selected.url,
                        file_type: selected.fileType,
                        mime_type: selected.mimeType || null,
                      },
                    ])
                  }
                />
              )}

              {media.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {media.map((item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      className="group relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
                    >
                      {item.file_type === "image" ? (
                        <Image
                          src={`${process.env.BACKEND_DOMAIN}/${item.url}`}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-[var(--text-muted)]">
                          Video
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-[#202124]/35 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Hashtags</label>
                <input
                  className={inputClass}
                  placeholder="#uptime #monitoring"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Link</label>
                <input
                  className={inputClass}
                  placeholder="https://"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Format</label>
                <select
                  className={inputClass}
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="">Not set</option>
                  {POST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SocialPostStatus)}
                >
                  {POST_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {getPostStatusMeta(value).label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Owner</label>
                <select
                  className={inputClass}
                  value={assignedTo ?? ""}
                  onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Unassigned</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Campaign</label>
                <input
                  className={inputClass}
                  placeholder="Diwali Sale"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  placeholder="Anything the team should know"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                {post ? "Save changes" : "Create post"}
              </button>
            </div>
          </div>
        </ClickOutside>
      </div>
    </>
  );
};

export default PostFormModal;
