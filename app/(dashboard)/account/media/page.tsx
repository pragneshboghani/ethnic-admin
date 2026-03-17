"use client";

import MediaActions from '@/actions/MediaAction';
import { formatDateTime } from '@/utils/formatDateTime';
import { formatFileSize } from '@/utils/formatFileSize';
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
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
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewMedia, setViewMedia] = useState<Media | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadAlt, setUploadAlt] = useState("");

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

    const openViewModal = (media: Media) => {
        setViewMedia(media);
        setViewModalOpen(true);
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
                const finalAlt = uploadAlt.trim() || file.name;

                try {
                    const res = await MediaActions.uploadMedia(base64, finalAlt);

                    toast.success(`Media Upload Success`)

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
                    setUploadModalOpen(false)

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

                        <button className="flex items-center gap-2 btn cursor-pointer" onClick={() => setUploadModalOpen(true)}>
                            <Plus size={18} />
                            <span>Upload Media</span>
                        </button>
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
                                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600"
                                        onClick={() => openViewModal(m)}
                                    >
                                        <Eye size={18} className="text-white" />
                                    </button>

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
            {viewModalOpen && viewMedia && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

                    <div className="relative rounded-xl p-4 w-[700px] glass-card">

                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 text-white hover:text-red-500"
                            onClick={() => setViewModalOpen(false)}
                        >
                            <X size={18} className="text-white" />
                        </button>

                        {viewMedia.file_type === "image" ? (
                            <img
                                src={`${BACKEND_DOMAIN}/${viewMedia.file_url}`}
                                alt={viewMedia.alt_text || ""}
                                className="w-full max-h-[70vh] object-cover rounded-lg float-right max-w-[250px] h-[250px] mr-7"
                            />
                        ) : (
                            <video
                                src={`${BACKEND_DOMAIN}/${viewMedia.file_url}`}
                                controls
                                className="w-full max-h-[70vh] rounded-lg"
                            />
                        )}

                        <div className="mt-4 text-white w-full">
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>Name:</strong> {viewMedia.file_name}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>ALT:</strong> {viewMedia.alt_text || "-"}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>File Type:</strong> {viewMedia.file_type}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>mime_type:</strong> {viewMedia.mime_type}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>Create Date:</strong> {formatDateTime(viewMedia.created_at)}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate mb-2'><strong>url:</strong> {`${process.env.BACKEND_DOMAIN}/${viewMedia.file_url}`}</p>
                            <p className='whitespace-nowrap max-w-[calc(100%-290px)] truncate'><strong>size:</strong> {formatFileSize(viewMedia.file_size)}</p>
                        </div>
                    </div>
                </div>
            )}
            {uploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-card p-6 flex flex-col gap-4 w-[620px]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const input = e.currentTarget.querySelector(
                                    'input[type="file"]'
                                ) as HTMLInputElement;
                                if (input && input.files) {
                                    handleFileChange({ target: input } as any);
                                }
                            }}
                        >
                            <h3 className="text-lg text-white mb-2">Upload Media</h3>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="text-white border p-2 rounded-sm w-fit"
                                />

                                <input
                                    type="text"
                                    placeholder="Enter ALT text (optional)"
                                    className="px-3 py-2 rounded-md text-white border w-fit"
                                    value={uploadAlt}
                                    onChange={(e) => setUploadAlt(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                                    onClick={() => setUploadModalOpen(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Media;