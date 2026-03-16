"use client";

import MediaActions from '@/actions/MediaAction';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Media {
    id: number;
    file_name: string;
    file_url: string;
    file_type: "image" | "video";
    alt_text: string | null;
    file_size: number | null;
    mime_type: string | null;
    created_at: string;
}

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const Media = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [media, setMedia] = useState<Media[]>([]);
    const [altModalOpen, setAltModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [newAltText, setNewAltText] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

    const tabs = [
        { id: 1, label: 'All Media', type: 'all' },
        { id: 2, label: "Images", type: 'image' },
        { id: 3, label: 'Videos', type: 'video' }
    ];

    const openAltModal = (media: Media) => {
        setSelectedMedia(media);
        setNewAltText(media.alt_text || "");
        setAltModalOpen(true);
    };

    const openDeleteModal = (media: Media) => {
        setMediaToDelete(media);
        setDeleteModalOpen(true);
    };
    const fetchMedia = async (type = "all") => {
        try {
            const res =
                type === "all"
                    ? await MediaActions.getAllMedia()
                    : await MediaActions.filterMedia(type);

            setMedia(res.data);
        } catch (error) {
            toast.error(`Fetch media error 😢: ${(error as Error).message}`);
        }
    };

    const handleTabClick = (tab: any) => {
        console.log('tab', tab)
        setActiveTab(tab.id);
        fetchMedia(tab.type);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();

            reader.onload = async () => {
                const base64 = reader.result as string;

                try {
                    const res = await MediaActions.uploadMedia(base64, file.name);

                    const newMedia: Media = {
                        id: res.mediaId,
                        file_name: file.name,
                        file_url: res.fileUrl,
                        file_type: file.type.startsWith("image") ? "image" : "video",
                        alt_text: file.name,
                        file_size: null,
                        mime_type: file.type,
                        created_at: new Date().toISOString(),
                    };

                    setMedia((prev) => [...prev, newMedia]);

                } catch (error) {
                    toast.error(`Image Upload failed 😢: ${(error as Error).message}`);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleUpdateAlt = async (id: number, currentAlt: string) => {
        try {
            await MediaActions.UpdateALT(id, currentAlt);
            fetchMedia()
            toast.success("ALT text updated successfully!");
            setSelectedMedia(null)
            setAltModalOpen(false)
        } catch (err: any) {
            toast.error(`Failed to update ALT: ${err.message}`);
        }
    };

    const handleConfirmDelete = async () => {
        if (!mediaToDelete) return;

        try {
            await MediaActions.DeleteMedia(mediaToDelete.id);
            toast.success("Media deleted successfully!");
            setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
        } catch (err: any) {
            toast.error(`Failed to delete media: ${err.message}`);
        } finally {
            setDeleteModalOpen(false);
            setMediaToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setMediaToDelete(null);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        {tabs.map((i) => (
                            <button
                                key={i.id}
                                onClick={() => handleTabClick(i)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                                    ${activeTab === i.id
                                        ? 'bg-white/20 text-white shadow-lg border border-white/20 rounded-xl'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {i.label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 btn cursor-pointer">
                            <Plus size={18} />
                            <span>Upload Media</span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="image_grid gap-5">

                    {media.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-zinc-600 border-2 border-dashed border-white/5 rounded-2xl">
                            No media found. Upload your first image.
                        </div>
                    ) : (
                        media.map((m) => (
                            <div
                                key={m.id}
                                className="relative cursor-pointer group"
                            >
                                {m.file_type === "image" ? (
                                    <img
                                        src={`${BACKEND_DOMAIN}/${m.file_url}`}
                                        alt={m.alt_text || ""}
                                        className="w-full h-full object-cover opacity-60 transition-opacity rounded-lg group-hover:opacity-100"
                                    />
                                ) : (
                                    <video
                                        src={`${BACKEND_DOMAIN}/${m.file_url}`}
                                        className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-100"
                                        controls
                                    />
                                )}

                                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 bg-black/70 transition-opacity rounded-lg group-hover:opacity-100">
                                    <button
                                        className="p-2 bg-white rounded-full hover:bg-gray-200"
                                        onClick={() => openAltModal(m)}
                                    >
                                        <Pencil size={18} className="text-gray-800" />
                                    </button>

                                    <button
                                        className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                                        onClick={() => openDeleteModal(m)}
                                    >
                                        <Trash2 size={18} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                </div>
            </div>
            {altModalOpen && selectedMedia && (
                <div className="fixed inset-0 bg-black/5=70 flex items-center justify-center z-50">
                    <div className="p-6 w-80 text-white glass-card">
                        <h3 className="text-lg font-semibold mb-4">Update ALT Text</h3>

                        <input
                            type="text"
                            className="w-full p-2 rounded-md text-black bg-white"
                            value={newAltText}
                            onChange={(e) => setNewAltText(e.target.value)}
                            placeholder="Enter ALT text"
                        />

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                                onClick={() => setAltModalOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                                onClick={() => handleUpdateAlt(selectedMedia.id, newAltText)}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteModalOpen && mediaToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="p-6 w-80 text-center glass-card">
                        <h3 className="text-lg font-semibold mb-4 text-white">
                            Delete Media
                        </h3>
                        <p className="mb-6 text-white">
                            Are you sure you want to delete <strong>{mediaToDelete.file_name}</strong>?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-black rounded hover:bg-gray-400"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Media;