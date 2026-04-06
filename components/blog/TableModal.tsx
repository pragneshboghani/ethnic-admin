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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/10 bg-[#101826] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <h2 className="text-lg font-semibold">Insert Table</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="table-rows" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Rows</label>
            <input
              id="table-rows"
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#eef4ff] outline-none focus:border-[#31425e]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="table-columns" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">Columns</label>
            <input
              id="table-columns"
              type="number"
              min={1}
              max={10}
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="w-full rounded-xl border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#eef4ff] outline-none focus:border-[#31425e]"
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
            className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
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
            className="rounded-xl bg-[#eef4ff] px-4 py-2 font-medium text-[#0f1724] transition hover:bg-white"
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
