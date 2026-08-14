"use client";

import PlateformActions from "@/actions/PlateFormActions";
import ClickOutside from "@/components/common/ClickOutside";
import AddEditPlatformModal from "@/components/plateform/AddEditPlatformModal";
import { Platform } from "@/types";
import {
  Activity,
  ExternalLink,
  Globe2,
  Pencil,
  Plus,
  Server,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const statTones = [
  "bg-[var(--status-purple-bg)] text-[var(--text-strong)]",
  "bg-[var(--status-green-bg)] text-[var(--text-strong)]",
  "bg-[var(--status-red-bg)] text-[var(--text-strong)]",
];

const sourceThemes = {
  platform: "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]",
  admin: "border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 text-[var(--status-purple-text)]",
};

const statusThemes = {
  Active: "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]",
  Inactive: "border-[var(--status-amber-text)]/28 bg-[#f9ab00]/16 text-[var(--status-amber-text)]",
};

export const StatCard = ({ label, value, note, tone, progress}: { label: string; value: number; note: string; tone: string; progress: number;}) => (
  <div
    className={`self-start rounded-[22px] border border-[var(--border)] h-full p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${tone}`}
  >
    <p className="text-sm font-medium text-[var(--text-strong)]/78">{label}</p>
    <p className="mt-3 text-3xl font-semibold leading-none text-[var(--text-strong)]">{value}</p>
    <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{note}</p>
    <div className="mt-3 h-1.5 rounded-full bg-black/[0.06]">
      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

const Plateforms = () => {
  const [platformData, setPlatformData] = useState<{ data: Platform[] } | null>(null);
  const [deletePlatformId, setDeletePlatformId] = useState<number | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchPlatforms = async () => {
    try {
      const res = await PlateformActions.getAllPlateform();
      setPlatformData(res);
    } catch (error) {
      console.error("Failed to fetch platforms", error);
      toast.error("Failed to load platforms 😢");
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await PlateformActions.deletePlateForm(id);
      toast.success("Platform successfully deleted!");
      fetchPlatforms();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete platform 😢");
    }
  };

  const platforms = platformData?.data || [];
  const activeCount = useMemo(
    () => platforms.filter((platform) => platform.status === "Active").length,
    [platforms],
  );
  const apiConnectedCount = useMemo(
    () =>
      platforms.filter(
        (platform) => !!platform.api_endpoint && platform.api_endpoint.trim() !== "",
      ).length,
    [platforms],
  );
  return (
    <>
      <section>
        <div className="grid items-start gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Platforms"
            value={platforms.length}
            note="Connected destinations available in this workspace"
            tone={statTones[0]}
            progress={100}
          />
          <StatCard
            label="Active"
            value={activeCount}
            note="Publishing connections currently ready to use"
            tone={statTones[1]}
            progress={(activeCount / platforms.length) * 100}
          />
          <StatCard
            label="API Ready"
            value={apiConnectedCount}
            note="Endpoints configured for direct publishing"
            tone={statTones[2]}
            progress={(apiConnectedCount / platforms.length) * 100}
          />
        </div>
      </section>

      <section className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Connection Library
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
              Manage every platform connection
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Review connection type, endpoint readiness, and status before publishing content.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-2 text-sm text-[var(--text-muted)]">
            {platforms.length} total platform{platforms.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
        {platforms.map((platform) => {
          const hasApi = !!platform.api_endpoint && platform.api_endpoint.trim() !== "";
          const sourceTone =
            sourceThemes[platform.data_source as keyof typeof sourceThemes] ||
            "border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--accent-text)]";
          const statusTone =
            statusThemes[platform.status as keyof typeof statusThemes] ||
            "border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--accent-text)]";

          return (
            <article
              key={platform.id}
              className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-[var(--accent)]/30 bg-[var(--bg-selected)] text-[var(--accent-text)]">
                      <Globe2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[24px] font-semibold tracking-tight text-[var(--text-strong)]">
                        {platform.platform_name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {hasApi ? "Direct publishing connection" : "Managed in admin workspace"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    title="Edit Platform"
                    onClick={() => {
                      setEditingPlatform(platform);
                      setOpenModal(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text)] transition hover:border-[var(--status-amber-text)]/40 hover:bg-[var(--status-red-bg)] hover:text-[var(--status-amber-text)]"
                    title="Delete Platform"
                    onClick={() => setDeletePlatformId(platform.id!)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}>
                  {platform.status}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${sourceTone}`}>
                  {platform.data_source === "platform" ? "Platform source" : "Admin source"}
                </span>
                <span className="rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/16 px-3 py-1 text-xs font-medium text-[var(--accent-text)]">
                  {platform.plateform_type || "Custom"}
                </span>
              </div>

              <div className="mt-6 gap-4 flex flex-col">
                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--status-green-text)]/30 bg-[#e9f3f6] text-[var(--accent)]">
                      <ExternalLink size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                        Website URL
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--text-strong)]">
                        {platform.website_url || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--status-purple-text)]/30 bg-[var(--status-purple-bg)] text-[#480b8e]">
                        <Server size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium truncate uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                          Endpoint
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--text-strong)]">
                          {hasApi ? platform.api_endpoint : "Not required"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--status-amber-text)]/30 bg-[var(--status-red-bg)] text-[var(--status-amber-text)]">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium truncate uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                          Authentication
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--text-strong)]">
                          {platform.auth_type || "No auth"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--accent)]/30 bg-[var(--bg-selected)] text-[var(--accent-text)]">
                      <Activity size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                        Publishing defaults
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                        Blog path: <span className="text-[var(--text-strong)]">{platform.blog_path || "Not set"}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                        CTA: <span className="text-[var(--text-strong)]">{platform.CTA_button_text || "Not set"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setEditingPlatform(null);
            setOpenModal(true);
          }}
          className="group flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--bg-selected)]">
            <Plus size={24} />
          </span>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
            Add New Platform
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-muted)]">
            Create another destination and keep your publishing network ready for the next blog.
          </p>
        </button>
      </div>

      {openModal && (
        <AddEditPlatformModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          editingPlatform={editingPlatform}
          refreshPlatforms={fetchPlatforms}
        />
      )}

      {deletePlatformId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4">
          <ClickOutside onClickOutside={() => setDeletePlatformId(null)}>
            <div className="w-full max-w-md rounded-[26px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Remove Platform
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">
                Delete this connection?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                This will remove the selected publishing destination from the dashboard. You can add it again later if needed.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeletePlatformId(null)}
                  className="rounded-[16px] border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deletePlatformId) {
                      handleDelete(deletePlatformId);
                      setDeletePlatformId(null);
                    }
                  }}
                  className="rounded-[16px] border border-[var(--status-amber-text)]/40 bg-[var(--status-red-bg)] px-4 py-2.5 text-sm font-medium text-[var(--status-amber-text)] transition hover:bg-[var(--status-red-bg)]"
                >
                  Delete Platform
                </button>
              </div>
            </div>
          </ClickOutside>
        </div>
      )}
    </>
  );
};

export default Plateforms;
