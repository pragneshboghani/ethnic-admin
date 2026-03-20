"use client";

import MediaActions from "@/actions/MediaAction";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    onSelectImage?: (url: string) => void;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
    isOpen,
    onClose,
    onUploadComplete,
    onSelectImage
}) => {
    const pathname = usePathname();

    const [uploadAlt, setUploadAlt] = useState("");
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

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
                    const res = await MediaActions.uploadMedia(base64, finalAlt);

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

                <div className={`${!IsMediaPage ? 'border-b pb-4' : ''}`}>
                    <h4 className="text-white mb-3 font-semibold">Upload New</h4>

                    <div className="flex flex-wrap gap-3 items-center">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="text-white border p-2 rounded"
                        />

                        <input
                            type="text"
                            placeholder="Enter ALT text (optional)"
                            value={uploadAlt}
                            onChange={(e) => setUploadAlt(e.target.value)}
                            className="px-3 py-2 rounded-md text-white border"
                        />

                        <button
                            type="button"
                            onClick={handleUpload}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                        >
                            Upload
                        </button>
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

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UploadMediaModal;