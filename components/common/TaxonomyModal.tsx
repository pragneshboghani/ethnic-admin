'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ClickOutside from "./ClickOutside";

export type PlatformResponse = {
    data?: Platform[];
};

export type TaxonomyModalEntity = {
    id: number;
    name: string;
    description?: string;
    status?: string;
    platform_ids?: number[];
} | null;

type TaxonomyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    type: "category" | "tag";
    entity?: TaxonomyModalEntity;
};

const inputClassName =
    "w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none";

const TaxonomyModal = ({ isOpen, onClose, onSuccess, type, entity, }: TaxonomyModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("publish");
    const [loading, setLoading] = useState(false);
    const [platformData, setPlatformData] = useState<PlatformResponse | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

    const isCategory = type === "category";
    const entityLabel = isCategory ? "Category" : "Tag";

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.getAllPlateform();
            setPlatformData(res);
        };

        void fetchPlatforms();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        setName(entity?.name ?? "");
        setDescription(entity?.description ?? "");
        setStatus(entity?.status ?? "publish");
        setSelectedPlatforms(entity?.platform_ids ?? []);
    }, [entity, isOpen]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert(`${entityLabel} name required`);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name,
                description,
                status,
                platforms: selectedPlatforms,
            };

            if (entity?.id) {
                if (isCategory) {
                    await CategoryAndTagAction.updateCategory(entity.id, payload);
                } else {
                    await CategoryAndTagAction.updateTag(entity.id, payload);
                }
                toast.success(`${entityLabel} successfully updated!`);
            } else {
                if (isCategory) {
                    await CategoryAndTagAction.createCategory(payload);
                } else {
                    await CategoryAndTagAction.createTag(payload);
                }
                toast.success(`${entityLabel} successfully created!`);
            }

            setName("");
            setDescription("");
            setStatus("publish");
            setSelectedPlatforms([]);

            onClose();
            onSuccess?.();
        } catch (err: unknown) {
            console.error(
                err instanceof Error ? err.message : `Failed to save ${type}`,
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <ClickOutside onClickOutside={onClose}>
                <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/10 bg-[#101826] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
                    <h2 className="text-xl font-semibold text-white">
                        {entity ? `Update ${entityLabel}` : `Create ${entityLabel}`}
                    </h2>

                    <label htmlFor={`${type}-name`} className="text-sm text-white">{entityLabel} Name </label>

                    <input id={`${type}-name`} type="text" placeholder={`${entityLabel} Name`} value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />

                    <label htmlFor={`${type}-description`} className="text-sm text-white">Description</label>

                    <textarea id={`${type}-description`} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClassName} />

                    <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Select Platforms</p>

                        <div className="max-h-40 space-y-2 overflow-y-auto rounded-[18px] border border-white/8 bg-[#151d2c] p-4">
                            {platformData?.data?.map((platform) => {
                                const showPlatform =
                                    platform.status === "Active" &&
                                    platform.api_endpoint &&
                                    platform.api_endpoint.trim() !== "";

                                if (!showPlatform || platform.id === undefined) return null;

                                const id = platform.id;

                                return (
                                    <div key={id} className="flex items-center gap-2">
                                        <input
                                            id={`${type}-platform-${id}`}
                                            type="checkbox"
                                            checked={selectedPlatforms.includes(id)}
                                            onChange={() => {
                                                setSelectedPlatforms((prev) =>
                                                    prev.includes(id)
                                                        ? prev.filter((item) => item !== id)
                                                        : [...prev, id],
                                                );
                                            }}
                                        />
                                        <label
                                            htmlFor={`${type}-platform-${id}`}
                                            className="text-sm text-white"
                                        >
                                            {platform.platform_name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <label htmlFor={`${type}-status`} className="text-sm text-white">Status</label>

                    <select
                        id={`${type}-status`}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={inputClassName}
                    >
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                    </select>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="rounded-xl bg-[#eef4ff] px-4 py-2 font-medium text-[#0f1724] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? entity?.id ? "Updating..." : "Creating..." : entity?.id ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </ClickOutside>
        </div>
    );
};

export default TaxonomyModal;
