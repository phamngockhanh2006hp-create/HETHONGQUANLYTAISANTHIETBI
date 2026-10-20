import React, { useState, useMemo, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Search, 
  Eye, 
  X
} from 'lucide-react';

interface LookupPageProps {
  initialSearch?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const LookupPage: React.FC<LookupPageProps> = ({ initialSearch = '', onNavigate }) => {
  const { assets, transactions, managers, isAdmin, currentUser } = useBlockchain();

  const [query, setQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labFilter, setLabFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    if (initialSearch) {
      setQuery(initialSearch);
    }
  }, [initialSearch]);

  const labRooms = useMemo(() => Array.from(new Set(assets.map(a => a.labRoom))), [assets]);
  const categories = useMemo(() => Array.from(new Set(assets.map(a => a.category))), [assets]);

  // Check matching transaction hashes
  const matchingTxAssetIds = useMemo(() => {
    if (!query.trim()) return new Set<string>();
    const lower = query.trim().toLowerCase();
    const ids = new Set<string>();
    transactions.forEach(t => {
      if (t.txHash.toLowerCase().includes(lower)) {
        ids.add(t.assetId.toLowerCase());
      }
    });
    return ids;
  }, [query, transactions]);

  const results = useMemo(() => {
    return assets.filter(item => {
      const q = query.trim().toLowerCase();
      const matchQuery = 
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.manager.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        matchingTxAssetIds.has(item.id.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchLab = labFilter === 'all' || item.labRoom === labFilter;
      const matchManager = !isAdmin || managerFilter === 'all' || item.manager === managerFilter;
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchQuery && matchStatus && matchLab && matchManager && matchCategory;
    });
  }, [assets, query, statusFilter, labFilter, managerFilter, categoryFilter, matchingTxAssetIds, isAdmin]);

  const resetAll = () => {
    setQuery('');
    setStatusFilter('all');
    setLabFilter('all');
    setManagerFilter('all');
    setCategoryFilter('all');
    setDateRange('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tra cứu thiết bị</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Tìm kiếm đa chiều theo mã tài sản, tên thiết bị, mã QR hoặc Transaction Hash trên Blockchain'
            : `Tra cứu thiết bị thuộc phạm vi phụ trách của ${currentUser?.name}`}
        </p>
      </div>

      {/* Large Search Bar */}
      <div className="p-6 bg-white/95 rounded-2xl border border-sky-200/80 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập mã Asset, tên thiết bị, mã QR hoặc Transaction Hash..."
            className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Filters */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 pt-2`}>
          {/* Tình trạng */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tình trạng</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="using">Đang sử dụng</option>
              <option value="available">Sẵn sàng</option>
              <option value="maintenance">Đang bảo trì</option>
              <option value="borrowed">Đang được mượn</option>
              <option value="stopped">Ngừng sử dụng</option>
            </select>
          </div>

          {/* Vị trí */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vị trí / Phòng thí nghiệm</label>
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Tất cả PTN</option>
              {labRooms.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Người phụ trách (Chỉ Admin) */}
          {isAdmin && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Người phụ trách</label>
              <select
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="all">Tất cả người phụ trách</option>
                {managers.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Loại thiết bị */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loại thiết bị</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Tất cả loại thiết bị</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Khoảng thời gian */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Khoảng thời gian</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="30days">Trong 30 ngày qua</option>
              <option value="year2026">Năm 2026</option>
              <option value="year2024">Năm 2024</option>
            </select>
          </div>
        </div>

        {(query || statusFilter !== 'all' || labFilter !== 'all' || (isAdmin && managerFilter !== 'all') || categoryFilter !== 'all') && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Tìm thấy <strong>{results.length}</strong> kết quả phù hợp</span>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc tìm kiếm</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Asset</th>
                <th className="py-3 px-4">Tên thiết bị</th>
                <th className="py-3 px-4">Vị trí</th>
                <th className="py-3 px-4">Loại thiết bị</th>
                <th className="py-3 px-4">Tình trạng</th>
                <th className="py-3 px-4">Người phụ trách</th>
                <th className="py-3 px-4 text-right">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy tài sản thiết bị nào khớp với từ khóa trong phạm vi được phân quyền.
                  </td>
                </tr>
              ) : (
                results.map(item => (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.labRoom}
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                      {item.category}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.manager}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('equipment-detail', { id: item.id })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg transition-colors border border-sky-200/70"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
