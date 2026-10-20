import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { Equipment } from '../types';

interface DeleteConfirmModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false
}) => {
  const [reason, setReason] = useState('Hết thời hạn khấu hao hoặc chuyển giao xử lý thanh lý thiết bị phòng lab');

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Xác nhận xóa thiết bị</h3>
              <p className="text-xs text-slate-500">{equipment.id} - {equipment.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1.5 text-rose-900">
            <div className="font-bold text-sm flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Bạn có chắc chắn muốn xóa thiết bị này không?</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Tài sản đã có lịch sử giao dịch sẽ không bị xóa khỏi lịch sử hệ thống.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
              <span>Nguyên tắc bất biến Blockchain</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Hệ thống sẽ chuyển trạng thái thiết bị sang <strong>"Ngừng sử dụng"</strong> và ghi nhận giao dịch <strong>DEACTIVATE_ASSET</strong> lên sổ cái. Thiết bị sẽ được ẩn khỏi danh sách mặc định nhưng vẫn có thể tra cứu lịch sử minh bạch.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lý do xóa / ngừng hoạt động:
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onConfirm(reason)}
              className="px-5 py-2 font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-rose-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác nhận xóa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
