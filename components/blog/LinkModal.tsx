'use client';

import { useState } from "react";
import { createPortal } from "react-dom";

type LinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    url: string;
    text: string;
    openInNewTab: boolean;
  }) => void;
  hasSelection: boolean;
};

const LinkModal = ({
  isOpen,
  onClose,
  onSubmit,
  hasSelection,
}: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const resetForm = () => {
    setUrl("");
    setText("");
    setOpenInNewTab(true);
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200  p-6 glass-card text-white shadow-2xl">
        <h2 className="text-lg font-semibold">Add Link</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {!hasSelection && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Link Text</label>
            <input
              type="text"
              placeholder="Enter display text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          <span>Open in new tab</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({ url, text, openInNewTab });
              resetForm();
            }}
            disabled={!url.trim()}
            className="btn"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LinkModal;
