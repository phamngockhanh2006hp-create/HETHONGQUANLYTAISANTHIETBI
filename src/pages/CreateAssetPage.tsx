import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { ManagerName } from '../types';
import { 
  PlusCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface CreateAssetPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CreateAssetPage: React.FC<CreateAssetPageProps> = ({ onNavigate }) => {
  const { allAssets, createAsset, setActiveTxModal, managers, currentUser, isAdmin } = useBlockchain();

  // Block unauthorized access if accessed directly
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Không có quyền truy cập</h2>
        <p className="text-xs text-slate-600">
          Chức năng Tạo Asset mới chỉ dành cho Quản trị viên hệ thống.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Auto-generate next ID like TS009
  const defaultNextId = () => {
    const existingNums = allAssets
      .map(a => parseInt(a.id.replace('TS', ''), 10))
      .filter(n => !isNaN(n));
    const max = existingNums.length > 0 ? Math.max(...existingNums) : 8;
    return 'TS' + (max + 1).toString().padStart(3, '0');
  };

  const [formData, setFormData] = useState({
    id: defaultNextId(),
    name: '',
    category: 'Thiết bị quang học & quan sát',
    labRoom: 'PTN Sinh học',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    price: '',
    manager: (managers[0]?.name || 'Phạm Ngọc Khánh') as ManagerName,
    description: ''
  });

  const [createdTxResult, setCreatedTxResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.id.trim()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = createAsset({
        id: formData.id.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        labRoom: formData.labRoom,
        manager: formData.manager,
        manufacturer: formData.manufacturer || 'Tiêu chuẩn quốc tế',
        model: formData.model || 'Standard Edition',
        serialNumber: formData.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        purchaseDate: formData.purchaseDate,
        price: formData.price ? `${formData.price} VNĐ` : 'Chưa định giá',
        description: formData.description
      }, currentUser?.name || 'Phạm Ngọc Khánh');

      setIsSubmitting(false);
      if (result.success) {
        setCreatedTxResult(result);
      }
    }, 400);
  };

  const handleCopyHash = () => {
    if (createdTxResult?.tx?.txHash) {
      navigator.clipboard.writeText(createdTxResult.tx.txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleResetForNew = () => {
    setCreatedTxResult(null);
    setFormData({
      id: defaultNextId(),
      name: '',
      category: 'Thiết bị quang học & quan sát',
      labRoom: 'PTN Sinh học',
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      price: '',
      manager: managers[0]?.name || 'Phạm Ngọc Khánh',
      description: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tạo asset mới</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Khởi tạo tài sản thiết bị mới vào hệ thống và ghi nhận thông tin bất biến trên Blockchain
        </p>
      </div>

      {/* Success Notification Banner after creation */}
      {createdTxResult && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Tạo asset thành công.</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  Giao dịch đã được ghi nhận thành công.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTxModal(createdTxResult.tx)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
            >
              <span>Xem biên lai chi tiết</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-800 truncate select-all">
                  {createdTxResult.tx.txHash.slice(0, 16)}...{createdTxResult.tx.txHash.slice(-8)}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-slate-500 hover:text-slate-700 p-1 rounded"
                  title="Sao chép toàn bộ TxHash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Block Number</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                #{createdTxResult.blockNumber}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Timestamp</span>
              <span className="font-medium text-slate-800">
                {createdTxResult.tx.timestamp}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('equipment-detail', { id: formData.id })}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Xem trang chi tiết & QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('equipment-list')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Về danh sách thiết bị
            </button>
            <button
              onClick={handleResetForNew}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition-colors ml-auto"
            >
              + Tạo thêm asset khác
            </button>
          </div>
        </div>
      )}

      {/* Form - NO image fields */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Section 1: General Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>1. Thông tin định danh thiết bị</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mã tài sản */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Asset <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="VD: TS009"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono font-semibold text-sky-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Mã định danh duy nhất trong Smart Contract</span>
            </div>

            {/* Tên thiết bị */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên thiết bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Máy điện di gel ngang chuyên dụng"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            {/* Loại thiết bị */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loại thiết bị</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              >
                <option value="Thiết bị quang học & quan sát">Thiết bị quang học & quan sát</option>
                <option value="Thiết bị tách chiết & lắng mẫu">Thiết bị tách chiết & lắng mẫu</option>
                <option value="Thiết bị cân đo chính xác">Thiết bị cân đo chính xác</option>
                <option value="Thiết bị bảo vệ & kiểm soát vi sinh">Thiết bị bảo vệ & kiểm soát vi sinh</option>
                <option value="Thiết bị quang phổ & phân tích hóa học">Thiết bị quang phổ & phân tích hóa học</option>
                <option value="Thiết bị nhiệt & khuấy trộn">Thiết bị nhiệt & khuấy trộn</option>
                <option value="Thiết bị điện di & sinh học phân tử">Thiết bị điện di & sinh học phân tử</option>
              </select>
            </div>

            {/* Phòng thí nghiệm / Vị trí */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí / Phòng thí nghiệm</label>
              <select
                value={formData.labRoom}
                onChange={(e) => setFormData({ ...formData, labRoom: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              >
                <option value="PTN Sinh học">PTN Sinh học</option>
                <option value="PTN Hóa học">PTN Hóa học</option>
                <option value="PTN Hóa lý">PTN Hóa lý</option>
                <option value="PTN Vi sinh">PTN Vi sinh</option>
                <option value="PTN Vật liệu Nano">PTN Vật liệu Nano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications & Manager */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Thông số kỹ thuật & Người phụ trách
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Hãng sản xuất */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hãng sản xuất</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="VD: Thermo Fisher Scientific"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="VD: Sub-Cell GT System"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="VD: TF-GT-88910"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-mono"
              />
            </div>

            {/* Ngày mua */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày mua / Ngày tạo</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            {/* Giá trị thiết bị */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị thiết bị</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="VD: 55.000.000"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            {/* Người phụ trách */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-sky-50/70 border border-sky-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-medium"
              >
                {managers.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.userRole === 'admin' ? 'Quản trị viên' : 'Người quản lý'})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Phân công cán bộ phụ trách thiết bị</span>
            </div>
          </div>
        </div>

        {/* Section 3: Description & Blockchain Signer */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. Mô tả chi tiết thiết bị
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú chi tiết về tình trạng bàn giao, độ chính xác, tiêu chuẩn phòng sạch..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 resize-none"
            />
          </div>

          {/* Người ký giao dịch */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Ký phát hành giao dịch Smart Contract</span>
              <span className="text-slate-500">Giao dịch được ký xác thực bởi tài khoản Quản trị viên đang đăng nhập</span>
            </div>
            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sky-800 font-semibold text-xs">
              {currentUser?.name} (Quản trị viên)
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('equipment-list')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang ghi lên Blockchain...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Tạo asset</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
