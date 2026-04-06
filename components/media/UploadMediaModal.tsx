"use client";

import MediaActions from "@/actions/MediaAction";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type UploadPlatformData = {
    data?: Array<{
        id: number;
        platform_name?: string;
        status?: string;
        api_endpoint?: string;
    }>;
} | null;

type MediaFileItem = {
    id: number;
    file_url: string;
    file_type: "image" | "video";
    mime_type?: string | null;
};

interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    onSelectImage?: (url: string) => void;
    onSelectMedia?: (media: { url: string; fileType: "image" | "video"; mimeType?: string | null }) => void;
    allowedMediaType?: "image" | "all";
    platformData: UploadPlatformData
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
    isOpen, onClose, onUploadComplete, onSelectImage, onSelectMedia, allowedMediaType = "image", platformData }) => {
    const pathname = usePathname();

    const [uploadAlt, setUploadAlt] = useState("");
    const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadMedia = async () => {
            try {
                const res = await MediaActions.getAllMedia();
                if (isMounted) {
                    setMediaFiles(res.data);
                }
            } catch {
                toast.error("Failed to load media 😢");
            }
        };

        void loadMedia();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await MediaActions.getAllMedia();
            setMediaFiles(res.data);
        } catch {
            toast.error("Failed to load media 😢");
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles) return;

        Array.from(selectedFiles).forEach((file) => {
            const reader = new FileReader();

            reader.onload = async () => {
                const base64 = reader.result as string;
                const finalAlt = uploadAlt.trim() || file.name;

                try {
                    const res = await MediaActions.uploadMedia(base64, finalAlt, selectedPlatforms);

                    toast.success("Media Upload Success 🎉");

                    await fetchMedia();

                    setUploadAlt("");
                    setSelectedFiles(null);

                    if (onSelectImage) {
                        onSelectImage(res.fileUrl);
                    }

                    if (onSelectMedia) {
                        onSelectMedia({
                            url: res.fileUrl,
                            fileType: file.type.startsWith("video") ? "video" : "image",
                            mimeType: file.type,
                        });
                    }

                    if (onUploadComplete) {
                        onUploadComplete();
                    }

                } catch (error: unknown) {
                    toast.error(`Upload failed 😢: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const IsMediaPage = pathname == '/account/media' ? true : false;
    const visibleMediaFiles = allowedMediaType === "all"
        ? mediaFiles
        : mediaFiles.filter((file) => file.file_type === "image");
    const selectedFileNames = selectedFiles ? Array.from(selectedFiles).map((file) => file.name) : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
            <div className="relative flex max-h-[88vh] w-full max-w-[980px] flex-col gap-6 overflow-y-auto rounded-[28px] border border-white/10 bg-[#101826] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-7">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#151d2c] text-[#dbe5f3] transition hover:border-[#31425e] hover:bg-[#182438]"
                >
                    <X size={18} />
                </button>

                {!IsMediaPage && (
                    <div className="pr-12">
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#8ea0b8]">
                            Media Manager
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#eef4ff]">Upload & Media Library</h3>
                        <p className="mt-2 text-sm leading-7 text-[#8ea0b8]">
                            Upload new assets or select an existing file from the library.
                        </p>
                    </div>
                )}

                <div className={`rounded-[24px] border border-white/8 bg-[#151d2c] p-5 ${!IsMediaPage ? "" : "mt-4"}`}>
                    <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-[#eef4ff]">Upload New</h4>
                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                {allowedMediaType === "all" ? "Images and videos are supported." : "Upload images for this blog."}
                            </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs text-[#8ea0b8]">
                            {selectedFileNames.length} selected
                        </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <input
                            type="file"
                            accept={allowedMediaType === "all" ? "image/*,video/*" : "image/*"}
                            multiple
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#dbe5f3] file:mr-4 file:rounded-lg file:border-0 file:bg-[#eef4ff] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#0f1724] focus:border-[#31425e] focus:outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Enter ALT text (optional)"
                            value={uploadAlt}
                            onChange={(e) => setUploadAlt(e.target.value)}
                            className="w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                        />
                    </div>

                    {selectedFileNames.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {selectedFileNames.map((fileName) => (
                                <span
                                    key={fileName}
                                    className="max-w-full truncate rounded-full border border-white/8 bg-[#101826] px-3 py-1.5 text-xs text-[#dbe5f3]"
                                >
                                    {fileName}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                                    Select Platforms
                                </p>
                                <span className="text-xs text-[#8ea0b8]">
                                    {selectedPlatforms.length} selected
                                </span>
                            </div>

                            <div className="max-h-40 space-y-2 overflow-y-auto rounded-[20px] border border-white/8 bg-[#101826] p-4">
                                {platformData?.data?.map((platform) => {
                                    const showPlatform =
                                        platform.status === 'Active' &&
                                        platform.api_endpoint &&
                                        platform.api_endpoint.trim() !== "";

                                    if (!showPlatform) return null;

                                    return (
                                        <label
                                            key={platform.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]"
                                        >
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
                                                className="h-4 w-4 accent-[#9ad8de]"
                                            />
                                            <span className="text-sm text-[#dbe5f3]">
                                                {platform.platform_name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!selectedFiles}
                            className="inline-flex items-center justify-center rounded-xl bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-[#7f90a8] disabled:text-[#101826]"
                        >
                            Upload
                        </button>
                    </div>
                </div>

                {!IsMediaPage && (
                    <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                        <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-[#eef4ff]">Media Library</h4>
                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Click any asset below to insert it into the editor.
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs text-[#8ea0b8]">
                                {visibleMediaFiles.length} items
                            </span>
                        </div>

                        {visibleMediaFiles.length === 0 ? (
                            <div className="mt-5 rounded-[20px] border border-dashed border-white/10 bg-[#101826] px-6 py-12 text-center">
                                <p className="text-base font-medium text-[#eef4ff]">No media found</p>
                                <p className="mt-2 text-sm text-[#8ea0b8]">
                                    Upload a new file to start building your media library.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 grid max-h-[420px] grid-cols-2 gap-4 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                                {visibleMediaFiles.map((file) => (
                                    <button
                                        key={file.id}
                                        type="button"
                                        className="group overflow-hidden rounded-[20px] border border-white/8 bg-[#101826] text-left transition hover:border-[#31425e] hover:bg-[#131d2c]"
                                        onClick={() => {
                                            if (onSelectImage) {
                                                onSelectImage(file.file_url);
                                            }
                                            if (onSelectMedia) {
                                                onSelectMedia({
                                                    url: file.file_url,
                                                    fileType: file.file_type,
                                                    mimeType: file.mime_type,
                                                });
                                            }
                                            onClose();
                                        }}
                                    >
                                        <div className="relative">
                                            {file.file_type === "video" ? (
                                                <video
                                                    src={`${process.env.BACKEND_DOMAIN}/${file.file_url}`}
                                                    className="h-[140px] w-full object-cover"
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={`${process.env.BACKEND_DOMAIN}/${file.file_url}`}
                                                    className="h-[140px] w-full object-cover"
                                                    alt={file.file_type}
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                                        </div>
                                        <div className="flex items-center justify-between gap-3 px-3 py-3">
                                            <span className="rounded-full border border-white/8 bg-[#151d2c] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-[#8ea0b8]">
                                                {file.file_type}
                                            </span>
                                            <span className="text-xs font-medium text-[#dbe5f3]">Use Media</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadMediaModal;
