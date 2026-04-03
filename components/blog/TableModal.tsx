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
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 p-6 glass-card text-white shadow-2xl">
        <h2 className="text-lg font-semibold">Insert Table</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="table-rows" className="text-sm font-medium text-slate-700">Rows</label>
            <input
              id="table-rows"
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="table-columns" className="text-sm font-medium text-slate-700">Columns</label>
            <input
              id="table-columns"
              type="number"
              min={1}
              max={10}
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
            className="btn"
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
            className="btn"
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
