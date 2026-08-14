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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#202124]/40 px-4">
      <div className="w-full max-w-md space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 text-[var(--text-strong)] shadow-[0_10px_28px_rgba(15,23,42,0.10)]">
        <h2 className="text-lg font-semibold">{isExistingLink ? "Edit Link" : "Add Link"}</h2>

        <div className="space-y-2">
          <label htmlFor="link-url" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">URL</label>
          <input
            id="link-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
          />
        </div>

        {(!hasSelection || isExistingLink) && (
          <div className="space-y-2">
            <label htmlFor="link-text" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Link Text</label>
            <input id="link-text" type="text" placeholder="Enter display text" value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-[var(--text)]">
          <input id="open-in-new-tab" type="checkbox" checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="h-4 w-4 accent-[#bce2e6]"
          />
          <span>Open in new tab</span>
        </label>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={() => {
            resetForm();
            onClose();
          }} className="rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text)] transition hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button type="button" onClick={() => {
            onSubmit({ url, text, openInNewTab });
            resetForm();
          }} disabled={!url.trim()} className="rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[#ffffff] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply
          </button>
          {isExistingLink && onRemove && (
            <button type="button" onClick={() => {
              onRemove();
              resetForm();
              onClose();
            }} className="rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text)] transition hover:bg-black/[0.04]"
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
