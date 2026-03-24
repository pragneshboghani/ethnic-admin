'use client';

import BlogActions from "@/actions/BlogAction";
import PlateformActions from "@/actions/PlateFormActions";
import { useEffect, useState } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

const CategoryModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("publish");
    const [loading, setLoading] = useState(false);
    const [platformData, setPlatformData] = useState<any>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.getAllPlateform();
            setPlatformData(res);
        };
        fetchPlatforms();
    }, []);

    const handleCreate = async () => {
        if (!categoryName.trim()) {
            alert("Category name required");
            return;
        }

        try {
            setLoading(true);

            await BlogActions.createCategory({
                name: categoryName,
                description,
                status,
                platforms: selectedPlatforms.length ? selectedPlatforms : [],
            });

            setCategoryName("");
            setDescription("");
            setStatus("publish");
            setSelectedPlatforms([]);

            onClose();
            onSuccess?.();
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="p-6 w-[400px] glass-card space-y-4">

                <h2 className="text-xl font-semibold text-white">
                    Create Category
                </h2>

                <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => {
                        setCategoryName(e.target.value);
                    }}
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <div className="space-y-2">
                    <label className="text-sm text-white">Select Platforms</label>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {platformData?.data?.map((platform: any) => (
                            <div key={platform.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedPlatforms.includes(platform.id)}
                                    onChange={() => {
                                        setSelectedPlatforms((prev) =>
                                            prev.includes(platform.id)
                                                ? prev.filter((id) => id !== platform.id)
                                                : [...prev, platform.id]
                                        );
                                    }}
                                />
                                <span className="text-white text-sm">
                                    {platform.platform_name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <select
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
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;