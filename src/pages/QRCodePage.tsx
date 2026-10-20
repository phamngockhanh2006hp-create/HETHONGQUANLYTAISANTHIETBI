import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { QRCodeBadge } from '../components/QRCodeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { QrCode, Search, Filter, Camera, Printer } from 'lucide-react';

interface QRCodePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenQRScanner: () => void;
  initialAssetId?: string;
}

export const QRCodePage: React.FC<QRCodePageProps> = ({ 
  onNavigate, 
  onOpenQRScanner,
  initialAssetId 
}) => {
  const { assets } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || assets[0]?.id || ''
  );

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const filteredAssets = assets.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.labRoom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">QR thiết bị</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mã QR định danh bảo mật cho từng tài sản phòng thí nghiệm, liên kết trực tiếp với Smart Contract
          </p>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Quét mã QR kiểm tra</span>
        </button>
      </div>

      {/* Main Focus Card: Selected Asset QR */}
      {selectedAsset && (
        <div className="p-6 bg-white/95 rounded-2xl border border-sky-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* The QR Component */}
            <div className="w-full md:w-auto shrink-0 flex justify-center">
              <QRCodeBadge
                equipment={selectedAsset}
                size={190}
                onViewDetail={() => onNavigate('equipment-detail', { id: selectedAsset.id })}
              />
            </div>

            {/* Detailed Spec for this selected QR */}
            <div className="flex-1 space-y-4 text-xs w-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-sm font-bold text-sky-700">{selectedAsset.id}</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">{selectedAsset.name}</h3>
                </div>
                <StatusBadge status={selectedAsset.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Phòng thí nghiệm</span>
                  <span className="font-semibold text-slate-800">{selectedAsset.labRoom}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Người quản lý</span>
                  <span className="font-semibold text-slate-800">{selectedAsset.manager}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Hãng sản xuất</span>
                  <span className="font-semibold text-slate-800">{selectedAsset.manufacturer}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Model</span>
                  <span className="font-semibold text-slate-800">{selectedAsset.model || 'Tiêu chuẩn'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Serial Number</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedAsset.serialNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-400 block mb-0.5">Ngày mua</span>
                  <span className="font-mono text-slate-800">{selectedAsset.purchaseDate}</span>
                </div>
              </div>

              <p className="text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                Tem mã QR được mã hóa theo chuẩn bảo mật chuỗi khối, quét mã sẽ đưa trực tiếp về thông tin xác thực vòng đời và lịch sử bàn giao của tài sản.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of all equipment QR codes with quick filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-800">
            Tất cả tem QR thiết bị ({filteredAssets.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Lọc mã QR theo tên hoặc phòng lab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedAssetId(item.id)}
              className={`cursor-pointer transition-all ${
                selectedAssetId === item.id ? 'ring-2 ring-sky-500 rounded-2xl' : ''
              }`}
            >
              <QRCodeBadge
                equipment={item}
                size={140}
                onViewDetail={() => onNavigate('equipment-detail', { id: item.id })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
