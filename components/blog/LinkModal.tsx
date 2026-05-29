'use client';

import { LinkModalProps } from "@/types";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LinkModal = ({ isOpen, onClose, onSubmit, onRemove, hasSelection, initialUrl = "", initialText = "", initialOpenInNewTab = true, isExistingLink = false }: LinkModalProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab);

  const resetForm = () => {
    setUrl("");
    setText("");
    setOpenInNewTab(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUrl(initialUrl);
    setText(initialText);
    setOpenInNewTab(initialOpenInNewTab);
  }, [isOpen, initialUrl, initialText, initialOpenInNewTab]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/10 bg-[#101826] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <h2 className="text-lg font-semibold">{isExistingLink ? "Edit Link" : "Add Link"}</h2>

        <div className="space-y-2">
          <label htmlFor="link-url" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">URL</label>
          <input
            id="link-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#eef4ff] outline-none placeholder:text-[#6f8096] focus:border-[#31425e]"
          />
        </div>

        {(!hasSelection || isExistingLink) && (
          <div className="space-y-2">
            <label htmlFor="link-text" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Link Text</label>
            <input id="link-text" type="text" placeholder="Enter display text" value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#eef4ff] outline-none placeholder:text-[#6f8096] focus:border-[#31425e]"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-[#dbe5f3]">
          <input id="open-in-new-tab" type="checkbox" checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="h-4 w-4 accent-[#9ad8de]"
          />
          <span>Open in new tab</span>
        </label>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={() => {
            resetForm();
            onClose();
          }} className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button type="button" onClick={() => {
            onSubmit({ url, text, openInNewTab });
            resetForm();
          }} disabled={!url.trim()} className="rounded-xl bg-[#eef4ff] px-4 py-2 font-medium text-[#0f1724] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply
          </button>
          {isExistingLink && onRemove && (
            <button type="button" onClick={() => {
              onRemove();
              resetForm();
              onClose();
            }} className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
            >
              Remove Link
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LinkModal;
