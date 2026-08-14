"use client";

import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ProjectActions from "@/actions/ProjectActions";
import type { Project, SocialChannel } from "@/types";

type SocialAccountsPanelProps = {
  project: Project;
  channels: SocialChannel[];
  canManage: boolean;
  onChanged: () => void;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-2.5 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";

const SocialAccountsPanel = ({
  project,
  channels,
  canManage,
  onChanged,
}: SocialAccountsPanelProps) => {
  const [channelId, setChannelId] = useState<number | "">("");
  const [accountName, setAccountName] = useState("");
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const accounts = project.accounts || [];

  const handleAdd = async () => {
    if (!channelId || !accountName.trim()) {
      toast.error("Pick a channel and name the account 😢");
      return;
    }

    setBusy(true);

    try {
      const response = await ProjectActions.addAccount({
        project_id: project.id,
        channel_id: Number(channelId),
        account_name: accountName.trim(),
        handle,
        profile_url: profileUrl,
      });

      toast.success(response.message || "Social account added 🎉");
      setChannelId("");
      setAccountName("");
      setHandle("");
      setProfileUrl("");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add social account 😢");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (accountId: number) => {
    setBusy(true);

    try {
      const response = await ProjectActions.deleteAccount(accountId);
      toast.success(response.message || "Social account removed 🗑️");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove social account 😢");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
        Social accounts
      </p>

      {accounts.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No accounts connected yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: account.channel_color || "#8fa0b6" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                  {account.account_name}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {account.channel_name}
                  {account.handle ? ` · ${account.handle}` : ""}
                </p>
              </div>

              {account.profile_url && (
                <a
                  href={account.profile_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--accent)]/24 bg-[var(--accent)]/14 text-[var(--accent-text)] transition hover:bg-[var(--accent)]/22"
                >
                  <ExternalLink size={13} />
                </a>
              )}

              {canManage && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(account.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--status-amber-text)]/24 bg-[#f9ab00]/14 text-[var(--status-amber-text)] transition hover:bg-[#f9ab00]/22 disabled:opacity-60"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
          <select
            className={inputClass}
            value={channelId}
            onChange={(e) => setChannelId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Channel</option>
            {channels
              .filter((channel) => channel.status === "active")
              .map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
          </select>

          <input
            className={inputClass}
            placeholder="Account name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="@handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="Profile URL"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />

          <button
            type="button"
            disabled={busy}
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] disabled:opacity-60 sm:col-span-2"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add account
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialAccountsPanel;
