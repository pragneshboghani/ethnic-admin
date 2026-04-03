'use client';

import CategoryAndTagAction from "@/actions/categoryAndTagAction";
import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";

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

type PlatformResponse = {
    data?: Platform[];
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
            } else {
                await CategoryAndTagAction.createTag(payload);
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="p-6 w-[400px] glass-card space-y-4">

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
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <label htmlFor="tag-description" className="text-sm text-white">Description</label>
                <textarea
                    id="tag-description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-white border"
                />

                <div className="space-y-2">
                    <label htmlFor="tag-platforms" className="text-sm text-white">Select Platforms</label>

                    <div id="tag-platforms" className="space-y-2 max-h-40 overflow-y-auto">
                        {platformData?.data?.map((platform) => {

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
                        {loading ? (tag ? "Updating..." : "Creating...") : (tag ? "Update" : "Create")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagModal;
