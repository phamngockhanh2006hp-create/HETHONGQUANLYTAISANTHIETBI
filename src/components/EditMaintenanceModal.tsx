import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { MaintenanceRecord, ManagerName } from '../types';
import { X, Wrench, Pencil, ShieldCheck } from 'lucide-react';

interface EditMaintenanceModalProps {
  record: MaintenanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMaintenanceModal: React.FC<EditMaintenanceModalProps> = ({
  record,
  isOpen,
  onClose
}) => {
  const { updateMaintenance, managers } = useBlockchain();

  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<ManagerName>('Đặng Vân Ly');
  const [expectedDate, setExpectedDate] = useState('');
  const [status, setStatus] = useState<'Chờ xử lý' | 'Đang bảo trì' | 'Hoàn thành' | 'Đã hủy'>('Đang bảo trì');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (record) {
      setIssue(record.issue);
      setDescription(record.description);
      setAssignee(record.assignee);
      setExpectedDate(record.expectedCompletionDate);
      setStatus(record.status);
      setNotes(record.notes);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;

    updateMaintenance(record.id, {
      issue: issue.trim(),
      description: description.trim(),
      assignee,
      expectedCompletionDate: expectedDate,
      status,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Chỉnh sửa phiếu bảo trì</h3>
              <p className="text-xs text-slate-500">{record.id} - {record.assetName} ({record.assetId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung lỗi bảo trì <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mô tả hiện tượng</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Người phụ trách</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as ManagerName)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
              >
                {managers.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dự kiến hoàn thành</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trạng thái bảo trì</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-amber-50/60 border border-amber-200 rounded-xl focus:bg-white text-amber-900 font-medium"
            >
              <option value="Chờ xử lý">Chờ xử lý</option>
              <option value="Đang bảo trì">Đang bảo trì</option>
              <option value="Hoàn thành">Hoàn thành (Nghiệm thu)</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-xs transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
