"use client";

import ClickOutside from "@/components/common/ClickOutside";
import { CalendarClock, ExternalLink, Pencil, Trash2, TriangleAlert, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import SocialPostActions from "@/actions/SocialPostActions";
import type { SocialPost } from "@/types";
import { formatScheduleLabel, getPostStatusMeta, isOverdue } from "@/utils/socialPostHelpers";

type PostDetailModalProps = {
  post: SocialPost;
  onClose: () => void;
  onEdit: () => void;
  onChanged: () => void;
};

const sectionLabel = "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";

const PostDetailModal = ({ post, onClose, onEdit, onChanged }: PostDetailModalProps) => {
  const [liveUrl, setLiveUrl] = useState(post.live_url || "");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusMeta = getPostStatusMeta(post.status);
  const overdue = isOverdue(post.status, post.scheduled_at);

  const handlePublish = async () => {
    setBusy(true);

    try {
      const response = await SocialPostActions.markPublished(post.id, liveUrl);
      toast.success(response.message || "Post marked as published 🎉");
      onChanged();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark as published 😢");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);

    try {
      const response = await SocialPostActions.deletePost(post.id);
      toast.success(response.message || "Post deleted 🗑️");
      onChanged();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete post 😢");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
      <ClickOutside onClickOutside={onClose}>
        <div className="modal-scroll max-h-[90vh] w-[680px] max-w-[92vw] overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-[var(--text-strong)] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
                {overdue && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-amber-text)]/40 bg-[#f9ab00]/16 px-2.5 py-1 text-xs font-medium text-[var(--status-amber-text)]">
                    <TriangleAlert size={12} /> Overdue
                  </span>
                )}
                {post.project_name && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: post.project_color || "#8fa0b6" }}
                    />
                    {post.project_name}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-[var(--text-strong)]">{post.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <CalendarClock size={14} />
                {formatScheduleLabel(post.scheduled_at)}
                {post.assigned_to_name && <span>· {post.assigned_to_name}</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
            >
              <X size={18} />
            </button>
          </div>

          {post.accounts.length > 0 && (
            <div className="mt-5">
              <p className={sectionLabel}>Going to</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.accounts.map((account) => (
                  <span
                    key={account.id}
                    className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text)]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: account.channel_color || "#8fa0b6" }}
                    />
                    {account.channel_name} — {account.account_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.caption && (
            <div className="mt-5">
              <p className={sectionLabel}>Caption</p>
              <p className="mt-2 whitespace-pre-wrap rounded-[22px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm leading-6 text-[var(--text)]">
                {post.caption}
              </p>
            </div>
          )}

          {post.hashtags && (
            <p className="mt-3 text-sm text-[var(--accent)]">{post.hashtags}</p>
          )}

          {post.media.length > 0 && (
            <div className="mt-5">
              <p className={sectionLabel}>Creative</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.media.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
                  >
                    {item.file_type === "image" ? (
                      <Image
                        src={`${process.env.BACKEND_DOMAIN}/${item.url}`}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-[var(--text-muted)]">
                        Video
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(post.link_url || post.campaign || post.blog_title) && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--accent-text)] transition hover:border-[var(--accent)]"
                >
                  <ExternalLink size={14} /> Linked URL
                </a>
              )}
              {post.campaign && (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text)]">
                  Campaign: {post.campaign}
                </p>
              )}
              {post.blog_title && (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text)] sm:col-span-2">
                  Promotes blog: {post.blog_title}
                </p>
              )}
            </div>
          )}

          {post.notes && (
            <div className="mt-5">
              <p className={sectionLabel}>Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-muted)]">{post.notes}</p>
            </div>
          )}

          {post.status !== "published" ? (
            <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className={sectionLabel}>Mark as posted</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Post it manually on the network, then paste the live link here.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-2.5 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="https://instagram.com/p/..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={handlePublish}
                  className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark as posted
                </button>
              </div>
            </div>
          ) : (
            post.live_url && (
              <a
                href={post.live_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--status-green-text)]/40 bg-[#1e8e3e]/14 px-4 py-3 text-sm text-[var(--status-green-text)] transition hover:bg-[#1e8e3e]/22"
              >
                <ExternalLink size={14} /> View live post
              </a>
            )
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
            {confirmDelete ? (
              <>
                <span className="mr-auto self-center text-sm text-[var(--status-amber-text)]">
                  Delete this post permanently?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDelete}
                  className="rounded-xl border border-[var(--status-amber-text)]/40 bg-[var(--status-red-bg)] px-4 py-2 text-sm font-medium text-[var(--status-amber-text)] transition hover:bg-[var(--status-red-bg)] disabled:opacity-60"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--status-amber-text)]/24 bg-[#f9ab00]/14 px-4 py-2 text-sm font-medium text-[var(--status-amber-text)] transition hover:bg-[#f9ab00]/22"
                >
                  <Trash2 size={15} /> Delete
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
                >
                  <Pencil size={15} /> Edit
                </button>
              </>
            )}
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default PostDetailModal;
