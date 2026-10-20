import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { CheckCircle2, Copy, Check, X, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

export const TransactionReceiptModal: React.FC = () => {
  const { activeTxModal, setActiveTxModal, contractAddress } = useBlockchain();
  const [copied, setCopied] = useState(false);

  if (!activeTxModal) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(activeTxModal.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-medium">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Biên lai Giao dịch Blockchain</h3>
              <p className="text-xs text-slate-500">Mã giao dịch được ghi nhận bất biến trên sổ cái</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTxModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-emerald-800 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Giao dịch đã được ghi nhận thành công</span>
            </div>
            <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded text-emerald-700 font-semibold uppercase">
              CONFIRMED
            </span>
          </div>

          {/* Key fields */}
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Transaction Hash</span>
                <button 
                  onClick={copyHash}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã sao chép' : 'Sao chép hash'}
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 break-all select-all">
                {activeTxModal.txHash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block mb-0.5">Khối (Block Number)</span>
                <span className="font-mono font-semibold text-slate-800 text-base">#{activeTxModal.blockNumber}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block mb-0.5">Thời gian ghi nhận</span>
                <span className="font-medium text-slate-800 text-sm">{activeTxModal.timestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block mb-0.5">Smart Contract Event</span>
                <span className="font-mono font-semibold text-sky-700 text-sm">{activeTxModal.eventName}</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block mb-0.5">Năng lượng ước tính (Gas Used)</span>
                <span className="font-mono text-slate-800 text-sm">{activeTxModal.gasUsed.toLocaleString()} wei</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Mã tài sản (Asset ID)</span>
                <span className="font-mono font-semibold text-slate-800">{activeTxModal.assetId}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Tên thiết bị</span>
                <span className="font-medium text-slate-800">{activeTxModal.assetName}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Người thực hiện ký giao dịch</span>
                <span className="font-medium text-slate-800">{activeTxModal.operator}</span>
              </div>
              {activeTxModal.recipient && (
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Đối tượng liên quan</span>
                  <span className="font-medium text-slate-800">{activeTxModal.recipient}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Địa chỉ Smart Contract</span>
                <span className="font-mono text-slate-600 text-[11px] truncate max-w-[240px]">{contractAddress}</span>
              </div>
            </div>

            {/* Event detail payload */}
            {activeTxModal.details && Object.keys(activeTxModal.details).length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Chi tiết dữ liệu giao dịch</span>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(activeTxModal.details, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button 
            onClick={() => setActiveTxModal(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
