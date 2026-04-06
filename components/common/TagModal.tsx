'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PlatformResponse } from "./CategoryModal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    tag?: {
        id: number;
        name: string;
        description?: string;
        status?: string;
        platform_ids?: number[];
    } | null;
};

const TagModal = ({ isOpen, onClose, onSuccess, tag }: Props) => {
    const [TagName, setTagName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("publish");
    const [loading, setLoading] = useState(false);
    const [platformData, setPlatformData] = useState<PlatformResponse | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.getAllPlateform();
            setPlatformData(res);
        };
        fetchPlatforms();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        setTagName(tag?.name ?? "");
        setDescription(tag?.description ?? "");
        setStatus(tag?.status ?? "publish");
        setSelectedPlatforms(tag?.platform_ids ?? []);
    }, [tag, isOpen]);

    const handleCreate = async () => {
        if (!TagName.trim()) {
            alert("Category name required");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: TagName,
                description,
                status,
                platforms: selectedPlatforms.length ? selectedPlatforms : [],
            };

            if (tag?.id) {
                await CategoryAndTagAction.updateTag(tag.id, payload);
                toast.success("Tag successfully updated!");
            } else {
                await CategoryAndTagAction.createTag(payload);
                toast.success("Tag successfully created!");
            }

            setTagName("");
            setDescription("");
            setStatus("publish");
            setSelectedPlatforms([]);

            onClose();
            onSuccess?.();
        } catch (err: unknown) {
            console.error(err instanceof Error ? err.message : "Failed to save tag");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/10 bg-[#101826] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">

                <h2 className="text-xl font-semibold text-white">
                    {tag ? "Update Tag" : "Create Tag"}
                </h2>

                <label htmlFor="tag-name" className="text-sm text-white">Tag Name</label>
                <input
                    id="tag-name"
                    type="text"
                    placeholder="Tag Name"
                    value={TagName}
                    onChange={(e) => {
                        setTagName(e.target.value);
                    }}
                    className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                />

                <label htmlFor="tag-description" className="text-sm text-white">Description</label>
                <textarea
                    id="tag-description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                />

                <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Select Platforms</p>

                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-[18px] border border-white/8 bg-[#151d2c] p-4">
                        {platformData?.data?.map((platform: any) => {

                            const ShowPlatform = platform.status === 'Active' && platform.api_endpoint && platform.api_endpoint.trim() !== "";

                            if (!ShowPlatform || platform.id === undefined) return null;
                            const id = platform.id;
                            return (
                                <div key={id} className="flex items-center gap-2">
                                    <input
                                        id={`tag-platform-${id}`}
                                        type="checkbox"
                                        checked={selectedPlatforms.includes(id)}
                                        onChange={() => {
                                            setSelectedPlatforms((prev) =>
                                                prev.includes(id)
                                                    ? prev.filter((i) => i !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                    />
                                    <label htmlFor={`tag-platform-${id}`} className="text-white text-sm">
                                        {platform.platform_name}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <label htmlFor="tag-status" className="text-sm text-white">Status</label>
                <select
                    id="tag-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white focus:border-[#31425e] focus:outline-none"
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
                        onClick={handleCreate}
                        disabled={loading}
                        className="rounded-xl bg-[#eef4ff] px-4 py-2 font-medium text-[#0f1724] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? tag?.id ? "Updating..." : "Creating..." : tag?.id ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagModal;
