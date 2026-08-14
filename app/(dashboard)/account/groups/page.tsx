"use client";

import AuthorActions from "@/actions/AuthorActions";
import GroupActions from "@/actions/GroupActions";
import ClickOutside from "@/components/common/ClickOutside";
import { Group } from "@/types";
import { Plus, Users, Pencil, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const GroupPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
  const canManageGroups =
    currentUserRole === "super_admin" || currentUserRole === "admin";

  useEffect(() => {
    const getAllGroups = async () => {
      try {
        const response = await GroupActions.getAllGroups();

        if (response?.success) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getAllGroups();
    const timeout = window.setTimeout(() => {
      const currentUser = AuthorActions.getCurrentUserRole();
      setCurrentUserRole(currentUser?.role || null);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleDeleteGroup = async () => {
    if (!deleteGroup) return;

    try {
      const response = await GroupActions.deleteGroup(deleteGroup.id);

      if (response?.success) {
        setGroups((prev) =>
          prev.filter((group) => group.id !== deleteGroup.id)
        );
        toast.success(response.message || "Group deleted successfully");
        setDeleteGroup(null);
        return;
      }

      toast.error(response?.message || "Failed to delete group");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete group");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6"
            >
              <div className="h-5 w-40 rounded bg-black/[0.05]" />
              <div className="mt-4 h-4 w-full rounded bg-black/[0.03]" />
              <div className="mt-2 h-4 w-3/4 rounded bg-black/[0.03]" />

              <div className="mt-6 flex gap-2">
                <div className="h-8 w-20 rounded-full bg-black/[0.05]" />
                <div className="h-8 w-20 rounded-full bg-black/[0.05]" />
              </div>
            </div>
          ))
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group.id}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-2xl bg-[var(--bg-inset)] text-[var(--status-green-text)]">
                      {group.image && group.image != "" ? (
                        <div className="relative h-15 w-15 rounded-2xl overflow-hidden border border-[var(--border)]">
                          <Image
                            fill
                            alt="Preview"
                            className="object-cover"
                            src={`${BACKEND_DOMAIN}/${group.image}`}
                          />
                        </div>
                      ) : (
                        <div className="relative h-15 w-15 rounded-2xl overflow-hidden border border-[var(--border)] flex items-center justify-center">
                          <Users size={22} />
                        </div>
                      )}
                    </div>
                    <h3 className="truncate text-lg font-semibold text-[var(--text-strong)]">
                      {group.name}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/account/authors/add/${group.created_by}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
                    title={canManageGroups ? "Edit Group" : "View Group"}
                  >
                    {canManageGroups ? <Pencil size={16} /> : <Eye size={16} />}
                  </Link>

                  {/* {canManageGroups && (
                    <button
                      type="button"
                      onClick={() => setDeleteGroup(group)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--status-amber-text)]/40 bg-[var(--status-red-bg)] text-[var(--status-amber-text)] transition hover:bg-[var(--status-red-bg)]"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  )} */}
                </div>
              </div>
              {/* <p className="mt-5 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">
                {group.group_description ||
                  "No description available for this group."}
              </p> */}
              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                    Members
                  </p>

                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs text-[var(--text-muted)]">
                    {group.member_ids?.length || 0} Members
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(group.member_ids && group.member_ids?.length > 0) ? (
                    group.members?.map((member, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-[#c1dde1] bg-[var(--bg-selected)] px-3 py-1.5 text-sm font-medium text-[var(--status-green-text)]"
                      >
                        {member}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">
                      No members added
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)]">
              <Users size={28} />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-[var(--text-strong)]">
              No Groups Found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              There are currently no groups available in this section.
            </p>

            {canManageGroups && (
              <Link
                href="/account/groups/add"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
              >
                <Plus size={18} />
                Create New Group
              </Link>
            )}
          </div>
        )}
      </div>

      {deleteGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
          <ClickOutside onClickOutside={() => setDeleteGroup(null)}>
            <div className="w-full max-w-md rounded-[26px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Remove Group
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">
                Delete {deleteGroup.group_name}?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                This will permanently remove this group from the workspace.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteGroup(null)}
                  className="rounded-[16px] border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="rounded-[16px] border border-[var(--status-amber-text)]/40 bg-[var(--status-red-bg)] px-4 py-2.5 text-sm font-medium text-[var(--status-amber-text)] transition hover:bg-[var(--status-red-bg)]"
                >
                  Delete Group
                </button>
              </div>
            </div>
          </ClickOutside>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
