import React from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBlockchain();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let style = 'bg-white border-slate-200 text-slate-800';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-600';

        if (toast.type === 'success') {
          style = 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-md';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          style = 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-md';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          style = 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-md';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'info') {
          style = 'bg-sky-50/95 border-sky-200 text-sky-900 shadow-md';
          Icon = Info;
          iconColor = 'text-sky-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border text-xs shadow-md transition-all animate-in slide-in-from-top-2 duration-150 backdrop-blur-xs ${style}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
