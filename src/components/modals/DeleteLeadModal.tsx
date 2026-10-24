import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteLeadModal: React.FC = () => {
  const { leadToDelete, setLeadToDelete, confirmDeleteLead } = useApp();

  if (!leadToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#111827] rounded-xl shadow-2xl border border-slate-800 max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1524]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Delete Lead</h3>
              <p className="text-[11px] text-slate-400">Confirm permanent record removal</p>
            </div>
          </div>
          <button
            onClick={() => setLeadToDelete(null)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-white">{leadToDelete.name}</span>
            {leadToDelete.company ? ` from ${leadToDelete.company}` : ''}?
          </p>
          <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-300 text-[11px] space-y-1">
            <p className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              This action cannot be undone.
            </p>
            <p className="text-rose-300/80 pl-5">
              This will permanently delete this lead record, their activity history, and any associated scheduled follow-up tasks.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setLeadToDelete(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteLead}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-rose-950/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
