'use client';

import { useState } from "react";
import { createPortal } from "react-dom";

type TableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { rows: number; columns: number }) => void;
};

const TableModal = ({ isOpen, onClose, onSubmit }: TableModalProps) => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);

  const resetForm = () => {
    setRows(2);
    setColumns(2);
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#202124]/40 px-4">
      <div className="w-full max-w-md space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 text-[var(--text-strong)] shadow-[0_10px_28px_rgba(15,23,42,0.10)]">
        <h2 className="text-lg font-semibold">Insert Table</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="table-rows" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Rows</label>
            <input
              id="table-rows"
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-strong)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="table-columns" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Columns</label>
            <input
              id="table-columns"
              type="number"
              min={1}
              max={10}
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-strong)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text)] transition hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({
                rows: Math.max(1, rows),
                columns: Math.max(1, columns),
              });
              resetForm();
            }}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
          >
            Insert
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TableModal;
