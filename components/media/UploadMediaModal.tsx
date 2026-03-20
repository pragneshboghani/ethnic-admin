"use client";

import MediaActions from "@/actions/MediaAction";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    onSelectImage?: (url: string) => void;
    platformData: any
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
    isOpen, onClose, onUploadComplete, onSelectImage, platformData }) => {
    const pathname = usePathname();

    const [uploadAlt, setUploadAlt] = useState("");
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

    if (!isOpen) return null;

    const fetchMedia = async () => {
        try {
            const res = await MediaActions.getAllMedia();
            setMediaFiles(res.data);
        } catch (err) {
            toast.error("Failed to load media 😢");
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

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

                    if (onUploadComplete) {
                        onUploadComplete();
                    }

                } catch (error: any) {
                    toast.error(`Upload failed 😢: ${error.message}`);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const IsMediaPage = pathname == '/account/media' ? true : false;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass-card p-6 flex flex-col gap-6 w-[800px] max-h-[85vh] overflow-y-auto">

                {IsMediaPage == false &&
                    <h3 className="text-lg text-white">Upload & Media Library</h3>
                }

                <button
                    type="button"
                    onClick={onClose}
                    className="text-white absolute right-4 top-4"
                >
                    <X size={18} />
                </button>

                <div className={`${!IsMediaPage ? 'border-b pb-4' : ''}`}>
                    <h4 className="text-white mb-3 font-semibold">Upload New</h4>

                    <div className="flex flex-wrap gap-3 items-center">

                        <div className="flex w-full gap-5">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="text-white border p-2 rounded w-full"
                            />

                            <input
                                type="text"
                                placeholder="Enter ALT text (optional)"
                                value={uploadAlt}
                                onChange={(e) => setUploadAlt(e.target.value)}
                                className="px-3 py-2 rounded-md text-white border w-full"
                            />
                        </div>


                        <div className="flex w-full gap-5 pt-3">
                            <div className="space-y-2 w-full">
                                <label className="text-md text-white">Select Platforms</label>

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
                                            <span className="text-white text-md">
                                                {platform.platform_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleUpload}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
                {IsMediaPage == false &&
                    <div>
                        <h4 className="text-white mb-3 font-semibold">Media Library</h4>

                        {mediaFiles.length === 0 ? (
                            <p className="text-white text-sm">No media found</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
                                {mediaFiles.map((file) => (
                                    <img
                                        key={file.id}
                                        src={`${process.env.BACKEND_DOMAIN}/${file.file_url}`}
                                        className="cursor-pointer rounded-lg border h-[120px] w-full object-cover transition"
                                        onClick={() => {
                                            if (onSelectImage) {
                                                onSelectImage(file.file_url);
                                            }
                                            onClose();
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

export default UploadMediaModal;