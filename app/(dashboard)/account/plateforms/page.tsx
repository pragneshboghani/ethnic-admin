"use client";

import PlateformActions from "@/actions/PlateFormActions";
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
  "bg-[linear-gradient(180deg,#5d366f_0%,#69407f_100%)] text-white",
  "bg-[linear-gradient(180deg,#2f6670_0%,#38757e_100%)] text-white",
  "bg-[linear-gradient(180deg,#b8664b_0%,#c27459_100%)] text-white",
];

const sourceThemes = {
  platform: "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
  admin: "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
};

const statusThemes = {
  Active: "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
  Inactive: "border-[#b8664b]/28 bg-[#b8664b]/16 text-[#ffd7c4]",
};

const StatCard = ({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  tone: string;
}) => (
  <div
    className={`self-start rounded-[22px] border border-white/8 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] ${tone}`}
  >
    <p className="text-sm font-medium text-white/78">{label}</p>
    <p className="mt-3 text-3xl font-semibold leading-none text-white">{value}</p>
    <p className="mt-3 text-sm leading-6 text-white/72">{note}</p>
    <div className="mt-3 h-1.5 rounded-full bg-white/15">
      <div className="h-full w-2/3 rounded-full bg-white" />
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
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingPlatform(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
          >
            <Plus size={16} />
            Add New Platform
          </button>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-3">
          <StatCard
            label="Platforms"
            value={platforms.length}
            note="Connected destinations available in this workspace"
            tone={statTones[0]}
          />
          <StatCard
            label="Active"
            value={activeCount}
            note="Publishing connections currently ready to use"
            tone={statTones[1]}
          />
          <StatCard
            label="API Ready"
            value={apiConnectedCount}
            note="Endpoints configured for direct publishing"
            tone={statTones[2]}
          />
        </div>
      </section>

      <section className="mt-6 rounded-[26px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">
              Connection Library
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#eef4ff]">
              Manage every platform connection
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
              Review connection type, endpoint readiness, and status before publishing content.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-4 py-2 text-sm text-[#8ea0b8]">
            {platforms.length} total platform{platforms.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {platforms.map((platform) => {
          const hasApi = !!platform.api_endpoint && platform.api_endpoint.trim() !== "";
          const sourceTone =
            sourceThemes[platform.data_source as keyof typeof sourceThemes] ||
            "border-[#354b73]/28 bg-[#354b73]/16 text-[#c8daf9]";
          const statusTone =
            statusThemes[platform.status as keyof typeof statusThemes] ||
            "border-[#354b73]/28 bg-[#354b73]/16 text-[#c8daf9]";

          return (
            <article
              key={platform.id}
              className="rounded-[26px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:border-[#31425e]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#354b73]/30 bg-[#182438] text-[#c8daf9]">
                      <Globe2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[24px] font-semibold tracking-tight text-[#eef4ff]">
                        {platform.platform_name}
                      </h3>
                      <p className="mt-1 text-sm text-[#8ea0b8]">
                        {hasApi ? "Direct publishing connection" : "Managed in admin workspace"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[#101826] text-[#dbe5f3] transition hover:border-[#31425e] hover:bg-[#182438]"
                    title="Edit Platform"
                    onClick={() => {
                      setEditingPlatform(platform);
                      setOpenModal(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[#101826] text-[#dbe5f3] transition hover:border-[#b8664b]/40 hover:bg-[#372423] hover:text-[#ffd7c4]"
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
                <span className="rounded-full border border-[#354b73]/28 bg-[#354b73]/16 px-3 py-1 text-xs font-medium text-[#c8daf9]">
                  {platform.plateform_type || "Custom"}
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[20px] border border-white/8 bg-[#101826] p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#2f6670]/30 bg-[#17303a] text-[#9ad8de]">
                      <ExternalLink size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                        Website URL
                      </p>
                      <p className="mt-1 truncate text-sm text-[#eef4ff]">
                        {platform.website_url || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-white/8 bg-[#101826] p-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#7a428f]/30 bg-[#24152f] text-[#d9b8ff]">
                        <Server size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                          Endpoint
                        </p>
                        <p className="mt-1 truncate text-sm text-[#eef4ff]">
                          {hasApi ? platform.api_endpoint : "Not required"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-white/8 bg-[#101826] p-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#b8664b]/30 bg-[#372423] text-[#ffd7c4]">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                          Authentication
                        </p>
                        <p className="mt-1 truncate text-sm text-[#eef4ff]">
                          {platform.auth_type || "No auth"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-[#101826] p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#354b73]/30 bg-[#182438] text-[#c8daf9]">
                      <Activity size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                        Publishing defaults
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#8ea0b8]">
                        Blog path: <span className="text-[#eef4ff]">{platform.blog_path || "Not set"}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#8ea0b8]">
                        CTA: <span className="text-[#eef4ff]">{platform.CTA_button_text || "Not set"}</span>
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
          className="group flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/12 bg-[#151d2c] p-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:border-[#31425e] hover:bg-[#182438]"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-[#101826] text-[#eef4ff] transition group-hover:border-[#31425e] group-hover:bg-[#141f31]">
            <Plus size={24} />
          </span>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[#eef4ff]">
            Add New Platform
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[#8ea0b8]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-[#101826] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">
              Remove Platform
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[#eef4ff]">
              Delete this connection?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
              This will remove the selected publishing destination from the dashboard. You can add it again later if needed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletePlatformId(null)}
                className="rounded-[16px] border border-white/10 px-4 py-2.5 text-sm font-medium text-[#b8c4d4] transition hover:bg-white/[0.04]"
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
                className="rounded-[16px] border border-[#b8664b]/40 bg-[#372423] px-4 py-2.5 text-sm font-medium text-[#ffd7c4] transition hover:bg-[#462a28]"
              >
                Delete Platform
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Plateforms;
