'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
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

            await CategoryAndTagAction.createCategory({
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/10 bg-[#101826] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">

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
                    className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                />

                <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Select Platforms</label>

                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-[18px] border border-white/8 bg-[#151d2c] p-4">
                        {platformData?.data?.map((platform: any) => {

                            const ShowPlatform = platform.status === 'Active' && platform.api_endpoint && platform.api_endpoint.trim() !== "";

                            if (!ShowPlatform) return null;
                            return (
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
                                </div>)
                        })}
                    </div>
                </div>
                <select
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
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
