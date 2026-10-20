import React, { useState, useMemo } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { StatusBadge } from '../components/StatusBadge';
import { EditEquipmentModal } from '../components/EditEquipmentModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  PlusCircle,
  X,
  ShieldCheck
} from 'lucide-react';
import { Equipment } from '../types';

interface EquipmentListPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialManagerFilter?: string;
}

export const EquipmentListPage: React.FC<EquipmentListPageProps> = ({ 
  onNavigate, 
  initialManagerFilter 
}) => {
  const { assets, managers, deleteAsset, addToast, isAdmin, currentUser } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labFilter, setLabFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>(initialManagerFilter || 'all');
  const [showStopped, setShowStopped] = useState<boolean>(false);

  // Modal states
  const [editingAsset, setEditingAsset] = useState<Equipment | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const labRooms = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.labRoom)));
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      if (!showStopped && statusFilter !== 'stopped' && item.status === 'stopped') {
        return false;
      }

      const matchSearch = 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manager.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchLab = labFilter === 'all' || item.labRoom === labFilter;
      const matchManager = !isAdmin || managerFilter === 'all' || item.manager === managerFilter;

      return matchSearch && matchStatus && matchLab && matchManager;
    });
  }, [assets, searchTerm, statusFilter, labFilter, managerFilter, showStopped, isAdmin]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLabFilter('all');
    setManagerFilter('all');
    setShowStopped(false);
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || labFilter !== 'all' || (isAdmin && managerFilter !== 'all') || showStopped;

  const handleInitiateDelete = (item: Equipment) => {
    if (!isAdmin) return;
    if (item.status === 'borrowed') {
      addToast('Không thể xóa vì thiết bị đang được mượn.', 'error');
      return;
    }
    if (item.status === 'maintenance') {
      addToast('Không thể xóa vì thiết bị đang trong quá trình bảo trì.', 'error');
      return;
    }
    setDeletingAsset(item);
  };

  const handleConfirmDelete = (reason: string) => {
    if (!deletingAsset) return;
    setIsDeleting(true);
    setTimeout(() => {
      deleteAsset(deletingAsset.id, reason, currentUser?.name);
      setIsDeleting(false);
      setDeletingAsset(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh sách thiết bị</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Quản lý và giám sát hiện trạng tất cả tài sản thiết bị phòng thí nghiệm' 
              : `Danh sách thiết bị thuộc phạm vi phụ trách của ${currentUser?.name}`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('create-asset')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tạo asset mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã Asset, tên thiết bị, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="using">Đang sử dụng</option>
              <option value="available">Sẵn sàng</option>
              <option value="maintenance">Đang bảo trì</option>
              <option value="borrowed">Đang được mượn</option>
              <option value="stopped">Ngừng sử dụng</option>
            </select>
          </div>

          {/* Lab Room Filter */}
          <div>
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            >
              <option value="all">Tất cả vị trí / phòng lab</option>
              {labRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          {/* Manager Filter - Admin only */}
          {isAdmin && (
            <div>
              <select
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              >
                <option value="all">Tất cả người phụ trách</option>
                {managers.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sub-bar with toggle to show stopped/deleted assets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showStopped}
              onChange={(e) => setShowStopped(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span>Hiển thị thiết bị đã ngừng sử dụng ({assets.filter(a => a.status === 'stopped').length})</span>
          </label>

          {hasActiveFilters && (
            <div className="flex items-center gap-3">
              <span>Tìm thấy <strong>{filteredAssets.length}</strong> thiết bị</span>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Table - Clean layout without images */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Asset</th>
                <th className="py-3.5 px-4">Tên thiết bị & Loại</th>
                <th className="py-3.5 px-4">Vị trí</th>
                <th className="py-3.5 px-4">Tình trạng</th>
                <th className="py-3.5 px-4">Người phụ trách</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-sky-50/40 transition-colors group"
                  >
                    {/* Mã Asset */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                        {item.id}
                      </span>
                    </td>

                    {/* Tên thiết bị & Loại (No image thumbnail) */}
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => onNavigate('equipment-detail', { id: item.id })}
                        className="font-semibold text-slate-800 hover:text-sky-600 cursor-pointer transition-colors"
                      >
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.category} · {item.manufacturer} {item.model ? `(${item.model})` : ''}
                      </div>
                    </td>

                    {/* Vị trí */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.labRoom}
                    </td>

                    {/* Tình trạng */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Người phụ trách */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-medium">{item.manager}</span>
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.createdAt || item.purchaseDate}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 1. Xem chi tiết */}
                        <button
                          onClick={() => onNavigate('equipment-detail', { id: item.id })}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 2. Sửa & 3. Xóa thiết bị (Chỉ Admin) */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingAsset(item)}
                              className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                              title="Sửa thiết bị"
                            >
                              <Pencil className="w-4 h-4 text-sky-600" />
                            </button>

                            <button
                              onClick={() => handleInitiateDelete(item)}
                              className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                              title="Xóa thiết bị"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
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

        {/* Table footer summary */}
        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isAdmin ? 'Tổng số thiết bị hoạt động:' : 'Số thiết bị đang phụ trách:'}{' '}
            <strong>{assets.filter(a => a.status !== 'stopped').length}</strong>
          </span>
          <span className="font-mono text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            Lịch sử giao dịch lưu trữ bất biến trên Blockchain
          </span>
        </div>
      </div>

      {/* Edit Equipment Modal */}
      {isAdmin && (
        <EditEquipmentModal
          equipment={editingAsset}
          isOpen={Boolean(editingAsset)}
          onClose={() => setEditingAsset(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <DeleteConfirmModal
          equipment={deletingAsset}
          isOpen={Boolean(deletingAsset)}
          onClose={() => setDeletingAsset(null)}
          onConfirm={handleConfirmDelete}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
};
