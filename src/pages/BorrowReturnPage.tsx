import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Repeat
} from 'lucide-react';

interface BorrowReturnPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: 'borrow' | 'return';
  initialAssetId?: string;
}

export const BorrowReturnPage: React.FC<BorrowReturnPageProps> = ({ 
  onNavigate, 
  initialTab = 'borrow',
  initialAssetId
}) => {
  const { assets, borrowAsset, returnAsset, setActiveTxModal, currentUser, isAdmin } = useBlockchain();
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>(initialTab);

  // Available equipment for borrowing (filtered by role in `assets`)
  const borrowableAssets = assets.filter(a => a.status === 'available' || a.status === 'using');
  // Currently borrowed equipment for returning (filtered by role in `assets`)
  const borrowedAssets = assets.filter(a => a.status === 'borrowed');

  // Borrow Form State
  const [borrowAssetId, setBorrowAssetId] = useState<string>(
    initialAssetId && borrowableAssets.some(a => a.id === initialAssetId)
      ? initialAssetId
      : borrowableAssets[0]?.id || ''
  );
  const [borrowerName, setBorrowerName] = useState<string>(currentUser?.name || 'Phạm Ngọc Khánh');
  const [borrowPurpose, setBorrowPurpose] = useState<string>('Thực hiện thí nghiệm đề tài NCKH cấp cơ sở');
  const [borrowDate, setBorrowDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [borrowNote, setBorrowNote] = useState<string>('Thiết bị sử dụng kèm vật tư tiêu hao đạt chuẩn');

  // Return Form State
  const [returnAssetId, setReturnAssetId] = useState<string>(
    initialAssetId && borrowedAssets.some(a => a.id === initialAssetId)
      ? initialAssetId
      : borrowedAssets[0]?.id || ''
  );
  const currentReturnAsset = assets.find(a => a.id === returnAssetId);
  const [returnerName, setReturnerName] = useState<string>(
    currentReturnAsset?.borrowInfo?.borrower || currentUser?.name || 'Phạm Ngọc Khánh'
  );
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipmentCondition, setEquipmentCondition] = useState<string>('Tốt, vệ sinh sạch sẽ, linh kiện nguyên vẹn');
  const [returnNote, setReturnNote] = useState<string>('Đã kiểm tra vận hành thử và bàn giao lại phòng lab');

  // Submission & Result state
  const [resultTx, setResultTx] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'return' && borrowedAssets.length > 0 && !borrowedAssets.some(a => a.id === returnAssetId)) {
      setReturnAssetId(borrowedAssets[0].id);
      setReturnerName(borrowedAssets[0].borrowInfo?.borrower || currentUser?.name || '');
    }
  }, [activeTab, borrowedAssets, returnAssetId, currentUser]);

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowAssetId || !borrowerName.trim()) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const res = borrowAsset(
        borrowAssetId,
        borrowerName.trim(),
        borrowPurpose,
        expectedReturnDate,
        borrowNote,
        currentUser?.name || borrowerName.trim()
      );
      setIsSubmitting(false);
      if (res.success) {
        setResultTx({ ...res.tx, actionType: 'BORROW' });
      }
    }, 400);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAssetId || !returnerName.trim()) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const res = returnAsset(
        returnAssetId,
        returnerName.trim(),
        equipmentCondition,
        returnNote,
        currentUser?.name || returnerName.trim()
      );
      setIsSubmitting(false);
      if (res.success) {
        setResultTx({ ...res.tx, actionType: 'RETURN' });
      }
    }, 400);
  };

  const handleCopy = () => {
    if (resultTx?.txHash) {
      navigator.clipboard.writeText(resultTx.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mượn / Trả thiết bị</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Theo dõi vòng đời sử dụng, chuyển đổi trạng thái toàn bộ thiết bị và ghi nhận giao dịch lên Blockchain'
            : `Theo dõi và ghi nhận tình trạng mượn/trả đối với các thiết bị thuộc phạm vi phụ trách của ${currentUser?.name}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => {
            setActiveTab('borrow');
            setResultTx(null);
          }}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'borrow'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mượn thiết bị ({borrowableAssets.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('return');
            setResultTx(null);
          }}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'return'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Trả thiết bị ({borrowedAssets.length})</span>
        </button>
      </div>

      {/* Success Notification */}
      {resultTx && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {resultTx.actionType === 'BORROW' ? 'Xác nhận mượn thiết bị thành công!' : 'Xác nhận trả thiết bị thành công!'}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {resultTx.actionType === 'BORROW' 
                    ? 'Thiết bị đã chuyển sang trạng thái "Đang được mượn" và ghi nhận lịch sử vào sổ cái.' 
                    : 'Thiết bị đã trở về trạng thái "Sẵn sàng" phục vụ các nghiên cứu tiếp theo.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTxModal(resultTx)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
            >
              <span>Xem biên lai</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-800 truncate select-all">
                  {resultTx.txHash.slice(0, 16)}...{resultTx.txHash.slice(-8)}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-slate-700 p-1 rounded"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Block Number</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                #{resultTx.blockNumber}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Smart Contract Event</span>
              <span className="font-mono font-semibold text-sky-700">
                {resultTx.eventName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('equipment-detail', { id: resultTx.assetId })}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Xem chi tiết thiết bị & dòng thời gian
            </button>
            <button
              onClick={() => setResultTx(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              Thực hiện giao dịch khác
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: MƯỢN THIẾT BỊ */}
      {activeTab === 'borrow' && (
        <form onSubmit={handleBorrowSubmit} className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-purple-800 uppercase tracking-wider pb-2 border-b border-purple-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Phiếu đăng ký mượn thiết bị</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thiết bị */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thiết bị <span className="text-rose-500">*</span>
                </label>
                <select
                  value={borrowAssetId}
                  onChange={(e) => setBorrowAssetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-medium"
                >
                  {borrowableAssets.length === 0 ? (
                    <option value="">Không có thiết bị khả dụng để mượn</option>
                  ) : (
                    borrowableAssets.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.name} ({item.labRoom} · {item.manager})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Người mượn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người mượn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="Nhập tên người mượn thiết bị..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 font-semibold"
                />
              </div>

              {/* Ngày mượn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày mượn</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                />
              </div>

              {/* Ngày dự kiến trả */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày dự kiến trả <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-purple-50/60 border border-purple-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-purple-900 font-semibold"
                />
              </div>
            </div>

            {/* Mục đích sử dụng */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mục đích sử dụng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={borrowPurpose}
                onChange={(e) => setBorrowPurpose(e.target.value)}
                placeholder="VD: Tiến hành phản ứng phân tích quang phổ của hợp chất mới..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
              <textarea
                rows={2}
                value={borrowNote}
                onChange={(e) => setBorrowNote(e.target.value)}
                placeholder="Phụ kiện đi kèm, điều kiện vận chuyển, bảo quản..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('equipment-list')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || borrowableAssets.length === 0}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang ghi lên Smart Contract...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Xác nhận mượn</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: TRẢ THIẾT BỊ */}
      {activeTab === 'return' && (
        <form onSubmit={handleReturnSubmit} className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider pb-2 border-b border-teal-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Xác nhận hoàn trả thiết bị về phòng Lab</span>
            </h2>

            {borrowedAssets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                Hiện tại không có thiết bị nào thuộc phạm vi quản lý đang trong trạng thái "Đang được mượn".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thiết bị */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thiết bị đang mượn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={returnAssetId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setReturnAssetId(id);
                      const found = assets.find(a => a.id === id);
                      if (found?.borrowInfo?.borrower) {
                        setReturnerName(found.borrowInfo.borrower);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 font-semibold"
                  >
                    {borrowedAssets.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.name} (Người mượn: {item.borrowInfo?.borrower || 'Chưa rõ'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Người trả */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Người trả <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={returnerName}
                    onChange={(e) => setReturnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 font-semibold"
                  />
                </div>

                {/* Ngày trả */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày trả</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                  />
                </div>

                {/* Tình trạng thiết bị */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tình trạng thiết bị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={equipmentCondition}
                    onChange={(e) => setEquipmentCondition(e.target.value)}
                    placeholder="VD: Tốt, đầy đủ linh kiện, hoạt động bình thường..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
              <textarea
                rows={2}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Ghi chú thêm về vệ sinh, kiểm tra thấu kính, cảm biến..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('equipment-list')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || borrowedAssets.length === 0}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu sổ cái...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận trả</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
