import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { ManagerName, MaintenanceRecord } from '../types';
import { EditMaintenanceModal } from '../components/EditMaintenanceModal';
import { 
  Wrench, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  X,
  Eye,
  Pencil,
  Trash2,
  Ban
} from 'lucide-react';

interface MaintenancePageProps {
  onNavigate: (page: string, params?: any) => void;
  initialAssetId?: string;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigate, initialAssetId }) => {
  const { 
    assets, 
    maintenanceRecords, 
    createMaintenance, 
    cancelMaintenance,
    completeMaintenance, 
    setActiveTxModal,
    transactions,
    addToast,
    isAdmin,
    currentUser,
    managers
  } = useBlockchain();

  const [showCreateModal, setShowCreateModal] = useState(Boolean(initialAssetId));
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [completeModalRecord, setCompleteModalRecord] = useState<MaintenanceRecord | null>(null);

  // Create form state
  const [assetId, setAssetId] = useState<string>(initialAssetId || assets[0]?.id || '');
  const [issue, setIssue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assignee, setAssignee] = useState<ManagerName>(currentUser?.name || 'Đặng Vân Ly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');

  // Complete maintenance form state (Admin approval)
  const [completedNotes, setCompletedNotes] = useState<string>('Đã kiểm định kỹ thuật đạt chuẩn, vệ sinh và hiệu chuẩn lại cảm biến.');
  const [completedDate, setCompletedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !issue.trim()) {
      return;
    }

    createMaintenance(
      assetId,
      issue,
      description,
      assignee,
      startDate,
      expectedDate,
      notes,
      currentUser?.name || assignee
    );

    setShowCreateModal(false);
    setIssue('');
    setDescription('');
    setNotes('');
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalRecord || !isAdmin) return;

    completeMaintenance(
      completeModalRecord.id,
      completedDate,
      completedNotes,
      currentUser?.name
    );

    setCompleteModalRecord(null);
  };

  const handleDeleteOrCancel = (record: MaintenanceRecord) => {
    if (!isAdmin) return;
    if (record.status === 'Đã hủy') {
      addToast('Bản ghi này đã ở trạng thái hủy.', 'info');
      return;
    }

    cancelMaintenance(record.id, 'Quản trị viên hủy phiếu bảo trì', currentUser?.name);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý bảo trì</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Theo dõi, phê duyệt nghiệm thu và quản lý toàn bộ hồ sơ bảo dưỡng thiết bị trên Blockchain'
              : `Theo dõi tình trạng bảo trì liên quan đến thiết bị do ${currentUser?.name} phụ trách`}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={assets.filter(a => a.status !== 'stopped').length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tạo yêu cầu bảo trì</span>
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã thiết bị</th>
                <th className="py-3.5 px-4">Tên thiết bị</th>
                <th className="py-3.5 px-4">Ngày yêu cầu</th>
                <th className="py-3.5 px-4">Nội dung bảo trì</th>
                <th className="py-3.5 px-4">Người phụ trách</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày hoàn thành</th>
                <th className="py-3.5 px-4">Transaction Hash</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {maintenanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Chưa có phiếu bảo trì nào được ghi nhận cho thiết bị phụ trách.
                  </td>
                </tr>
              ) : (
                maintenanceRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      {item.assetId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {item.assetName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.requestDate}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={item.issue}>
                      {item.issue}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.assignee}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.status === 'Chờ xử lý' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Chờ xử lý
                        </span>
                      )}
                      {item.status === 'Đang bảo trì' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Đang bảo trì
                        </span>
                      )}
                      {item.status === 'Hoàn thành' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoàn thành
                        </span>
                      )}
                      {item.status === 'Đã hủy' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3 text-rose-500" />
                          Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.completedDate || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[90px]">{item.txHash.slice(0, 8)}...</span>
                        <button
                          onClick={() => copyHash(item.txHash)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Sao chép TxHash"
                        >
                          {copiedHash === item.txHash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Thao tác: Chỉ Admin mới có nút Sửa, Hủy và Duyệt nghiệm thu */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 1. Xem */}
                        <button
                          onClick={() => {
                            const tx = transactions.find(t => t.txHash === item.txHash);
                            if (tx) {
                              setActiveTxModal(tx);
                            } else {
                              onNavigate('equipment-detail', { id: item.assetId });
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Xem chi tiết giao dịch bảo trì"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin-only actions: Sửa, Xóa/Hủy, Duyệt nghiệm thu */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingRecord(item)}
                              className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                              title="Sửa thông tin phiếu bảo trì"
                            >
                              <Pencil className="w-3.5 h-3.5 text-sky-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteOrCancel(item)}
                              className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                              title="Hủy phiếu bảo trì"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>

                            {item.status === 'Đang bảo trì' && (
                              <button
                                onClick={() => setCompleteModalRecord(item)}
                                className="ml-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                title="Duyệt nghiệm thu hoàn thành bảo trì (Chỉ Quản trị viên)"
                              >
                                Duyệt nghiệm thu
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tạo yêu cầu bảo trì */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Tạo yêu cầu bảo trì</h3>
                  <p className="text-xs text-slate-500">Khởi tạo hồ sơ kỹ thuật và lưu vết trên Blockchain</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thiết bị cần bảo trì <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assetId}
                  onChange={(e) => {
                    setAssetId(e.target.value);
                    const found = assets.find(a => a.id === e.target.value);
                    if (found) setAssignee(found.manager);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                >
                  {assets.filter(a => a.status !== 'stopped').map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id} - {a.name} ({a.labRoom})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung lỗi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="VD: Lỗi lệch bước sóng detector, đèn deuterium yếu..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả hiện tượng</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết triệu chứng, mã lỗi hiển thị trên màn hình..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người phụ trách <span className="text-rose-500">*</span>
                  </label>
                  {isAdmin ? (
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                    >
                      {managers.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={currentUser?.name || ''}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                  />
                </div>
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tên đơn vị bảo dưỡng chính hãng, số hợp đồng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Tạo yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa phiếu bảo trì (Chỉ Admin) */}
      {isAdmin && (
        <EditMaintenanceModal
          record={editingRecord}
          isOpen={Boolean(editingRecord)}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {/* Modal: Duyệt Hoàn thành bảo trì (Chỉ Admin) */}
      {isAdmin && completeModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Duyệt nghiệm thu bảo trì thiết bị</h3>
                  <p className="text-xs text-slate-500">{completeModalRecord.assetName} ({completeModalRecord.assetId})</p>
                </div>
              </div>
              <button
                onClick={() => setCompleteModalRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày duyệt hoàn thành</label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kết quả nghiệm thu & Ghi chú <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={completedNotes}
                  onChange={(e) => setCompletedNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-800">
                Sau khi Quản trị viên duyệt xác nhận, thiết bị sẽ tự động chuyển về trạng thái <strong>"Sẵn sàng"</strong> và phát hành giao dịch hoàn thành trên blockchain.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalRecord(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Phê duyệt nghiệm thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
