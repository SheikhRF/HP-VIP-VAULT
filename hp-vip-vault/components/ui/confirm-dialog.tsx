"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-lg font-black italic uppercase text-white tracking-tighter">{title}</h2>
        </div>

        <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-8">{message}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-orange-500 text-black py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] transition-transform"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
