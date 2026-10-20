import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeBadge } from '../components/QRCodeBadge';
import { EditEquipmentModal } from '../components/EditEquipmentModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { 
  ArrowLeft, 
  ArrowLeftRight, 
  BookOpen, 
  CheckCircle2, 
  Wrench, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Pencil,
  Trash2,
  ShieldAlert
} from 'lucide-react';

interface EquipmentDetailPageProps {
  assetId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const EquipmentDetailPage: React.FC<EquipmentDetailPageProps> = ({ assetId, onNavigate }) => {
  const { getAssetById, getAssetTimeline, setActiveTxModal, transactions, deleteAsset, addToast, isAdmin, currentUser } = useBlockchain();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Strict data-level lookup: do NOT fall back to assets[0] if assetId is unauthorized or non-existent
  const asset = getAssetById(assetId);
  const timeline = asset ? getAssetTimeline(asset.id) : [];

  if (!asset) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-xs space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Không có quyền truy cập hoặc thiết bị không tồn tại</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Mã thiết bị <strong className="font-mono text-slate-700">{assetId}</strong> không tồn tại hoặc thuộc quyền phụ trách của người quản lý khác. Bạn chỉ được phép xem thông tin chi tiết của những thiết bị mình được phân công phụ trách.
        </p>
        <button
          onClick={() => onNavigate('equipment-list')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Quay lại danh sách thiết bị phụ trách
        </button>
      </div>
    );
  }

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleInitiateDelete = () => {
    if (!isAdmin) return;
    if (asset.status === 'borrowed') {
      addToast('Không thể xóa vì thiết bị đang được mượn.', 'error');
      return;
    }
    if (asset.status === 'maintenance') {
      addToast('Không thể xóa vì thiết bị đang trong quá trình bảo trì.', 'error');
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (reason: string) => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteAsset(asset.id, reason, currentUser?.name);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      onNavigate('equipment-list');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button and title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('equipment-list')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {asset.id}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                {asset.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{asset.category} · {asset.labRoom}</p>
          </div>
        </div>

        {/* Action Buttons based on role */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Bàn giao (Admin only can initiate handover) */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('handover', { assetId: asset.id })}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bàn giao</span>
            </button>
          )}

          {/* 2. Mượn / Trả */}
          {asset.status === 'borrowed' ? (
            <button
              onClick={() => onNavigate('borrow-return', { tab: 'return', assetId: asset.id })}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Trả thiết bị</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('borrow-return', { tab: 'borrow', assetId: asset.id })}
              disabled={asset.status === 'maintenance' || asset.status === 'stopped'}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Mượn thiết bị</span>
            </button>
          )}

          {/* 3. Gửi bảo trì */}
          <button
            onClick={() => onNavigate('maintenance', { assetId: asset.id })}
            disabled={asset.status === 'stopped'}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Gửi bảo trì</span>
          </button>

          {/* 4. Chỉnh sửa & 5. Xóa thiết bị (Chỉ Admin) */}
          {isAdmin && (
            <>
              <div className="h-5 w-px bg-slate-200 mx-1"></div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5 text-sky-600" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={handleInitiateDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa thiết bị</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Grid - Clean layout without image placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Device Info & Specs (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            {/* Primary metadata header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Mã Asset:</span>
                  <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                    {asset.id}
                  </span>
                </div>
                <StatusBadge status={asset.status} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{asset.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                  {asset.description || 'Thiết bị phòng thí nghiệm nghiên cứu khoa học chuyên sâu.'}
                </p>
              </div>

              {asset.borrowInfo && (
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Thông tin đang mượn</span>
                  </div>
                  <div>Người mượn: <strong>{asset.borrowInfo.borrower}</strong></div>
                  <div>Hạn dự kiến trả: <strong>{asset.borrowInfo.expectedReturnDate}</strong></div>
                  <div>Mục đích: {asset.borrowInfo.purpose}</div>
                </div>
              )}
            </div>

            {/* Specifications Matrix */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Người phụ trách</span>
                <span className="font-bold text-sky-800">{asset.manager}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Vị trí / Phòng lab</span>
                <span className="font-semibold text-slate-800">{asset.labRoom}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Loại thiết bị</span>
                <span className="font-semibold text-slate-800 truncate block">{asset.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Hãng sản xuất</span>
                <span className="font-semibold text-slate-800">{asset.manufacturer}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Model</span>
                <span className="font-semibold text-slate-800">{asset.model || 'Standard'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Serial Number</span>
                <span className="font-mono font-semibold text-slate-800">{asset.serialNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Ngày tạo / Ngày mua</span>
                <span className="font-mono text-slate-800">{asset.createdAt || asset.purchaseDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Giá trị nguyên giá</span>
                <span className="font-semibold text-slate-800">{asset.price}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Thông tin Blockchain</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã xác thực sổ cái
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Code Badge (1 col) */}
        <div className="space-y-4">
          <QRCodeBadge
            equipment={asset}
            size={180}
            showActions={true}
          />
        </div>
      </div>

      {/* Vertical Timeline: History of Device */}
      <div className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Lịch sử sử dụng thiết bị</h2>
            <p className="text-xs text-slate-500">Chuỗi thời gian các sự kiện được ghi nhận bất biến trên Blockchain</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {timeline.length} bản ghi
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có sự kiện nào ghi nhận cho thiết bị này.
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((event) => (
              <div key={event.id} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-500 group-hover:scale-125 transition-transform shadow-xs"></div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-sky-50/40 hover:border-sky-200 transition-all text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{event.action}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500">{event.date} - {event.time}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      {event.status}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-normal">
                    {event.content}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span>Người thực hiện: </span>
                      <strong className="text-slate-700 font-semibold">{event.operator}</strong>
                    </div>

                    <div>
                      <span>Khối: </span>
                      <strong className="font-mono text-slate-800">#{event.blockNumber}</strong>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-1.5">
                      <span className="font-mono truncate max-w-[130px]">{event.txHash.slice(0, 14)}...</span>
                      <button
                        onClick={() => copyHash(event.txHash)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Sao chép TxHash"
                      >
                        {copiedHash === event.txHash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const tx = transactions.find(t => t.txHash === event.txHash);
                          if (tx) setActiveTxModal(tx);
                        }}
                        className="text-sky-600 hover:text-sky-700 p-0.5 ml-1"
                        title="Xem biên lai blockchain"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isAdmin && (
        <EditEquipmentModal
          equipment={asset}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Modal */}
      {isAdmin && (
        <DeleteConfirmModal
          equipment={asset}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
};
