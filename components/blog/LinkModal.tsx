'use client';
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const LinkModal = ({ isOpen, onClose, onSubmit, hasSelection }: any) => {
    const [mounted, setMounted] = useState(false);
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [openInNewTab, setOpenInNewTab] = useState(true); 
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
            <div className="w-[400px] p-6 space-y-4 glass-card">
                <h2 className="text-lg font-semibold">Add Link</h2>

                <input
                    type="text"
                    placeholder="Enter URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                />

                {!hasSelection && (
                    <input
                        type="text"
                        placeholder="Enter display text..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                )}

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={openInNewTab}
                        onChange={(e) => setOpenInNewTab(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm">Open in new tab</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={() => {
                            onClose();
                            setUrl("");
                            setText("");
                            setOpenInNewTab(true);
                        }}
                        className="btn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSubmit({ url, text, openInNewTab });
                            setUrl("");
                            setText("");
                            setOpenInNewTab(true);
                        }}
                        className="btn"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LinkModal;