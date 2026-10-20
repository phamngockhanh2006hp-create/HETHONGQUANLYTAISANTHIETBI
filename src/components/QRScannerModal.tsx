import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { X, ScanLine, Camera, Search, ArrowRight, ShieldAlert } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (assetId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSelectAsset }) => {
  const { assets, isAdmin, currentUser } = useBlockchain();
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [manualInput, setManualInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);

  useEffect(() => {
    if (assets.length > 0 && !assets.some(a => a.id === selectedAssetId)) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  if (!isOpen) return null;

  const handleSimulateScan = (id: string) => {
    if (!id) return;
    // Verify asset belongs to allowed `assets`
    const allowed = assets.find(a => a.id.toUpperCase() === id.toUpperCase());
    if (!allowed) {
      setErrorMsg(
        isAdmin
          ? `Không tìm thấy thiết bị có mã "${id}" trong hệ thống.`
          : `Thiết bị "${id}" không thuộc phạm vi phụ trách của ${currentUser?.name}. Bạn không được phép truy cập thiết bị của người khác.`
      );
      return;
    }

    setScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setScanning(false);
      onSelectAsset(allowed.id);
      onClose();
    }, 500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualInput.trim().toUpperCase();
    if (!query) return;

    let target = assets.find(a => a.id.toUpperCase() === query);
    if (!target) {
      target = assets.find(a => query.includes(a.id.toUpperCase()));
    }
    if (!target) {
      target = assets.find(a => a.name.toLowerCase().includes(manualInput.toLowerCase().trim()));
    }

    if (target) {
      handleSimulateScan(target.id);
    } else {
      setErrorMsg(
        isAdmin
          ? `Không tìm thấy thiết bị nào khớp với mã "${manualInput}".`
          : `Mã "${manualInput}" không tồn tại hoặc không thuộc phạm vi quản lý của bạn (${currentUser?.name}).`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Quét Mã QR Thiết Bị</h3>
              <p className="text-xs text-slate-500">Tra cứu nhanh thiết bị thuộc phạm vi quản lý</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="p-6 space-y-5">
          <div className="relative mx-auto w-56 h-56 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-sky-400"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-sky-400"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-sky-400"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-sky-400"></div>

            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_2s_infinite]"></div>

            <div className="text-center p-4 z-10">
              <ScanLine className="w-10 h-10 text-sky-400/80 mx-auto animate-pulse mb-2" />
              <p className="text-[11px] text-slate-400">
                {scanning ? 'Đang giải mã QR...' : 'Đưa mã QR thiết bị vào khung quét'}
              </p>
            </div>
          </div>

          {/* Quick select demo option */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 block">
              Mô phỏng quét mã QR trong phạm vi phụ trách:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.name} ({a.labRoom})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSimulateScan(selectedAssetId)}
                disabled={scanning || assets.length === 0}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <span>Quét ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-700 block">
              Hoặc nhập mã Asset để kiểm tra quyền truy cập (VD: TS001, TS004...):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập mã tài sản hoặc chuỗi QR..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tra cứu
              </button>
            </div>
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2 mt-1">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
