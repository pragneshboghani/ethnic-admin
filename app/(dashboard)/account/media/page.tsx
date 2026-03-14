"use client";

import MediaActions from '@/actions/MediaAction';
import { Eye, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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

    const tabs = [
        { id: 1, label: 'All Media', type: 'all' },
        { id: 2, label: "Images", type: 'image' },
        { id: 3, label: 'Videos', type: 'video' }
    ];

    const fetchMedia = async (type = "all") => {
        try {
            const res =
                type === "all"
                    ? await MediaActions.getAllMedia()
                    : await MediaActions.filterMedia(type);

            setMedia(res.data);
        } catch (error) {
            console.error("Fetch media error", error);
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
                    console.error("Upload failed", error);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    useEffect(() => {
        fetchMedia();
    }, []);

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
                        <label className="flex items-center gap-2 btn btn-secondary cursor-pointer">
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
                                className="cursor-pointer"
                            >
                                {m.file_type === "image" ? (
                                    <img
                                        src={`${BACKEND_DOMAIN}/${m.file_url}`}
                                        alt={m.alt_text || ""}
                                        className="w-full h-full object-cover opacity-60 transition-opacity rounded-lg"
                                    />
                                ) : (
                                    <video
                                        src={`${BACKEND_DOMAIN}/${m.file_url}`}
                                        className="w-full h-full object-cover opacity-60 transition-opacity"
                                        controls
                                    />
                                )}
                            </div>
                        ))
                    )}

                </div>
            </div>
        </>
    );
};

export default Media;