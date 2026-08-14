"use client";

import MediaActions from "@/actions/MediaAction";
import { MediaFileItem, UploadMediaModalProps } from "@/types";
import { fileToBase64, optimizeUploadFile } from "@/utils/imageUpload";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ClickOutside from "../common/ClickOutside";

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
    isOpen, onClose, onUploadComplete, onSelectImage, onSelectMedia, allowedMediaType = "image", platformData }) => {
    const pathname = usePathname();

    const [uploadAlt, setUploadAlt] = useState("");
    const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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
        if (!selectedFiles || isUploading) return;

        setIsUploading(true);

        try {
            for (const file of Array.from(selectedFiles)) {
                const optimizedFile = await optimizeUploadFile(file);
                const base64 = await fileToBase64(optimizedFile);
                const finalAlt = uploadAlt.trim() || file.name;
                const res = await MediaActions.uploadMedia(base64, finalAlt, selectedPlatforms);

                if (onSelectImage) {
                    onSelectImage(res.fileUrl);
                }

                if (onSelectMedia) {
                    onSelectMedia({
                        url: res.fileUrl,
                        fileType: file.type.startsWith("video") ? "video" : "image",
                        mimeType: optimizedFile.type || file.type,
                    });
                }
            }

            toast.success("Media Upload Success 🎉");
            await fetchMedia();
            setUploadAlt("");
            setSelectedFiles(null);
            onUploadComplete?.();
            onClose()
        } catch (error: unknown) {
            toast.error(`Upload failed 😢: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsUploading(false);
        }
    };

    const IsMediaPage = pathname == '/account/media' ? true : false;
    const visibleMediaFiles = allowedMediaType === "all"
        ? mediaFiles
        : mediaFiles.filter((file) => file.file_type === "image");
    const selectedFileNames = selectedFiles ? Array.from(selectedFiles).map((file) => file.name) : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4 sm:p-6">
            <ClickOutside onClickOutside={onClose}>
                <div className="relative flex max-h-[88vh] w-full max-w-[980px] flex-col gap-6 overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:p-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    >
                        <X size={18} />
                    </button>

                    {!IsMediaPage && (
                        <div className="pr-12">
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
                                Media Manager
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">Upload & Media Library</h3>
                            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                                Upload new assets or select an existing file from the library.
                            </p>
                        </div>
                    )}

                    <div className={`rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 ${!IsMediaPage ? "" : "mt-4"}`}>
                        <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-[var(--text-strong)]">Upload New</h4>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {allowedMediaType === "all" ? "Images and videos are supported." : "Upload images for this blog."}
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs text-[var(--text-muted)]">
                                {selectedFileNames.length} selected
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <input
                                type="file"
                                accept={allowedMediaType === "all" ? "image/*,video/*" : "image/*"}
                                multiple
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#ffffff] focus:border-[var(--accent)] focus:outline-none"
                            />

                            <input
                                type="text"
                                placeholder="Enter ALT text (optional)"
                                value={uploadAlt}
                                onChange={(e) => setUploadAlt(e.target.value)}
                                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none"
                            />
                        </div>

                        {selectedFileNames.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedFileNames.map((fileName) => (
                                    <span
                                        key={fileName}
                                        className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1.5 text-xs text-[var(--text)]"
                                    >
                                        {fileName}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                            {platformData && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                                            Select Platforms
                                        </p>
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {selectedPlatforms.length} selected
                                        </span>
                                    </div>

                                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                                        {platformData?.data?.map((platform) => {
                                            const showPlatform =
                                                platform.status === 'Active' &&
                                                platform.api_endpoint &&
                                                platform.api_endpoint.trim() !== "";

                                            if (!showPlatform) return null;

                                            return (
                                                <label
                                                    key={platform.id}
                                                    className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-black/[0.03]"
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
                                                        className="h-4 w-4 accent-[#bce2e6]"
                                                    />
                                                    <span className="text-sm text-[var(--text)]">
                                                        {platform.platform_name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFiles || isUploading}
                                className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[#edeff3] disabled:text-[#2a436f]"
                            >
                                {isUploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                    </div>

                    {!IsMediaPage && (
                        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                            <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-[var(--text-strong)]">Media Library</h4>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Click any asset below to insert it into the editor.
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs text-[var(--text-muted)]">
                                    {visibleMediaFiles.length} items
                                </span>
                            </div>

                            {visibleMediaFiles.length === 0 ? (
                                <div className="mt-5 rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-12 text-center">
                                    <p className="text-base font-medium text-[var(--text-strong)]">No media found</p>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                                        Upload a new file to start building your media library.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 grid max-h-[420px] grid-cols-2 gap-4 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                                    {visibleMediaFiles.map((file) => (
                                        <button
                                            key={file.id}
                                            type="button"
                                            className="group overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] text-left transition hover:border-[var(--accent)] hover:bg-[var(--bg-surface)]"
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
                                                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                                    {file.file_type}
                                                </span>
                                                <span className="text-xs font-medium text-[var(--text)]">Use Media</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ClickOutside>
        </div>
    );
};

export default UploadMediaModal;
