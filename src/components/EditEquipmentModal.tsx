import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { Equipment, EquipmentStatus, ManagerName } from '../types';
import { X, Pencil, Lock, ShieldCheck } from 'lucide-react';

interface EditEquipmentModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onUpdated
}) => {
  const { updateAsset, managers, isAdmin } = useBlockchain();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [labRoom, setLabRoom] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [manager, setManager] = useState<ManagerName>('Phạm Ngọc Khánh');
  const [status, setStatus] = useState<EquipmentStatus>('available');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (equipment) {
      setName(equipment.name);
      setCategory(equipment.category);
      setLabRoom(equipment.labRoom);
      setManufacturer(equipment.manufacturer);
      setModel(equipment.model);
      setSerialNumber(equipment.serialNumber);
      setPurchaseDate(equipment.purchaseDate);
      setPrice(equipment.price);
      setManager(equipment.manager);
      setStatus(equipment.status);
      setDescription(equipment.description);
    }
  }, [equipment]);

  if (!isOpen || !equipment || !isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = updateAsset(equipment.id, {
        name: name.trim(),
        category,
        labRoom,
        manufacturer,
        model,
        serialNumber,
        purchaseDate,
        price,
        manager,
        status,
        description
      });

      setIsSubmitting(false);
      if (res.success) {
        if (onUpdated) onUpdated();
        onClose();
      }
    }, 300);
  };

  const isCriticalChange = 
    manager !== equipment.manager ||
    status !== equipment.status ||
    labRoom !== equipment.labRoom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Chỉnh sửa thông tin thiết bị</h3>
              <p className="text-xs text-slate-500">Mã Asset: <strong className="font-mono text-sky-800">{equipment.id}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - NO image selection */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Note about Asset ID locking */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2 text-slate-600">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Mã Asset định danh (<strong className="font-mono text-slate-800">{equipment.id}</strong>) đã được tạo trên Blockchain và không thể thay đổi.
            </span>
          </div>

          {isCriticalChange && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2 text-sky-800">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Thay đổi Người phụ trách, Trạng thái hoặc Phòng lab sẽ tự động ký một bản ghi giao dịch mới trên sổ cái.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên thiết bị */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Tên thiết bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
              />
            </div>

            {/* Loại thiết bị */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại thiết bị</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
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

            {/* Vị trí / Phòng thí nghiệm */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vị trí / Phòng thí nghiệm</label>
              <select
                value={labRoom}
                onChange={(e) => setLabRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              >
                <option value="PTN Sinh học">PTN Sinh học</option>
                <option value="PTN Hóa học">PTN Hóa học</option>
                <option value="PTN Hóa lý">PTN Hóa lý</option>
                <option value="PTN Vi sinh">PTN Vi sinh</option>
                <option value="PTN Vật liệu Nano">PTN Vật liệu Nano</option>
              </select>
            </div>

            {/* Hãng sản xuất */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hãng sản xuất</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
              />
            </div>

            {/* Ngày mua */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày mua</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              />
            </div>

            {/* Giá trị thiết bị */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giá trị thiết bị</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
              />
            </div>

            {/* Người phụ trách */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Người phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full px-3 py-2 bg-sky-50/70 border border-sky-300 rounded-xl focus:bg-white text-slate-800 font-semibold"
              >
                {managers.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tình trạng thiết bị</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
              >
                <option value="available">Sẵn sàng</option>
                <option value="using">Đang sử dụng</option>
                <option value="maintenance">Đang bảo trì</option>
                <option value="borrowed">Đang được mượn</option>
                <option value="stopped">Ngừng sử dụng</option>
              </select>
            </div>

            {/* Mô tả */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
