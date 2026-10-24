import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-violet-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-800/80 bg-slate-900/95 shadow-emerald-950/30',
    error: 'border-rose-800/80 bg-slate-900/95 shadow-rose-950/30',
    info: 'border-violet-800/80 bg-slate-900/95 shadow-violet-950/30',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-3 duration-150 pointer-events-auto">
      <div
        className={`p-3.5 rounded-xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all ${
          borders[toast.type]
        }`}
      >
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
