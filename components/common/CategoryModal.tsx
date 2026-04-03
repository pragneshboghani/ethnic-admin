'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";

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
            } else {
                await CategoryAndTagAction.createCategory(payload);
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="p-6 w-[400px] glass-card space-y-4">

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
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <label htmlFor="category-description" className="text-sm text-white">Description</label>
                <textarea
                    id="category-description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <div className="space-y-2">
                    <label htmlFor="category-platforms" className="text-sm text-white">Select Platforms</label>

                    <div id="category-platforms" className="space-y-2 max-h-40 overflow-y-auto">
                        {platformData?.data?.map((platform) => {

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
                    className="w-full px-4 py-2 rounded-lg text-white border"
                >
                    <option value="publish" className="text-black">Publish</option>
                    <option value="draft" className="text-black">Draft</option>
                </select>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn">
                        Cancel
                    </button>

                    <button onClick={handleCreate} disabled={loading} className="btn">
                        {loading ? (category ? "Updating..." : "Creating...") : (category ? "Update" : "Create")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
