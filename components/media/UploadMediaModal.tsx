"use client";

import MediaActions from "@/actions/MediaAction";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    onSelectImage?: (url: string) => void;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({ isOpen, onClose, onUploadComplete, onSelectImage }) => {
    const [uploadAlt, setUploadAlt] = useState("");

    if (!isOpen) return null;

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

                    toast.success(`Media Upload Success`);

                    setUploadAlt("");
                    
                    if (onSelectImage) {
                        onSelectImage(res.fileUrl);
                    }
                    if (onUploadComplete) {
                        onUploadComplete();
                    }
                    onClose();
                } catch (error: any) {
                    toast.error(`Upload failed 😢: ${error.message}`);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card p-6 flex flex-col gap-4 w-[620px]">
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
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const input = document.querySelector(
                                'input[type="file"]'
                            ) as HTMLInputElement;

                            if (input?.files) {
                                handleFileChange({ target: input } as any);
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadMediaModal;