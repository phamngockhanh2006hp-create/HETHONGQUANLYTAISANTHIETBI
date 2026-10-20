import React, { useState } from 'react';
import { SOLIDITY_CONTRACT_CODE } from '../blockchain/solidityContract';
import { X, Copy, Check, FileCode, Shield } from 'lucide-react';

interface SolidityContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolidityContractModal: React.FC<SolidityContractModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(SOLIDITY_CONTRACT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Smart Contract: LabAssetManager.sol</h3>
              <p className="text-xs text-slate-400">Solidity ^0.8.20 · Chuẩn hợp đồng quản lý vòng đời tài sản phòng thí nghiệm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép' : 'Sao chép mã nguồn'}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300">
          <pre className="select-all whitespace-pre-wrap">{SOLIDITY_CONTRACT_CODE}</pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-900 text-slate-400 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Triển khai trên mạng LabChain EVM Local Testnet · Hỗ trợ đầy đủ Event logging & Access Control</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
