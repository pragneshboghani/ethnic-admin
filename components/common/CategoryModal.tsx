'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ClickOutside from "./ClickOutside";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    category?: {
        id: number;
        name: string;
        description?: string;
        status?: string;
        platform_ids?: number[];
    } | null;
};

export type PlatformResponse = {
    data?: Platform[];
};

const CategoryModal = ({ isOpen, onClose, onSuccess, category }: Props) => {
    const [categoryName, setCategoryName] = useState("");
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

        setCategoryName(category?.name ?? "");
        setDescription(category?.description ?? "");
        setStatus(category?.status ?? "publish");
        setSelectedPlatforms(category?.platform_ids ?? []);
    }, [category, isOpen]);

    const handleCreate = async () => {
        if (!categoryName.trim()) {
            alert("Category name required");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: categoryName,
                description,
                status,
                platforms: selectedPlatforms.length ? selectedPlatforms : [],
            };
            if (category?.id) {
                await CategoryAndTagAction.updateCategory(category.id, payload);
                toast.success("Category successfully updated!");
            } else {
                await CategoryAndTagAction.createCategory(payload);
                toast.success("Category successfully created!");
            }

            setCategoryName("");
            setDescription("");
            setStatus("publish");
            setSelectedPlatforms([]);

            onClose();
            onSuccess?.();
        } catch (err: unknown) {
            console.error(err instanceof Error ? err.message : "Failed to save category");
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
                        {category ? "Update Category" : "Create Category"}
                    </h2>

                    <label htmlFor="category-name" className="text-sm text-white">Category Name</label>
                    <input
                        id="category-name"
                        type="text"
                        placeholder="Category Name"
                        value={categoryName}
                        onChange={(e) => {
                            setCategoryName(e.target.value);
                        }}
                        className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                    />

                    <label htmlFor="category-description" className="text-sm text-white">Description</label>
                    <textarea
                        id="category-description"
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
                                            id={`category-platform-${id}`}
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
                                        <label htmlFor={`category-platform-${id}`} className="text-white text-sm">
                                            {platform.platform_name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <label htmlFor="category-status" className="text-sm text-white">Status</label>
                    <select
                        id="category-status"
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
                            {loading ? category?.id ? "Updating..." : "Creating..." : category?.id ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </ClickOutside>
        </div>
    );
};

export default CategoryModal;
