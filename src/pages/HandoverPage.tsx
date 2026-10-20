import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { ManagerName } from '../types';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface HandoverPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialAssetId?: string;
}

export const HandoverPage: React.FC<HandoverPageProps> = ({ onNavigate, initialAssetId }) => {
  const { assets, managers, handoverAsset, setActiveTxModal, transactions, isAdmin, currentUser } = useBlockchain();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId || assets[0]?.id || '');
  const currentAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const [recipient, setRecipient] = useState<ManagerName>(() => {
    const alt = managers.find(m => m.name !== currentAsset?.manager)?.name;
    return alt || managers[0]?.name || 'Đặng Vân Ly';
  });
  const [labRoom, setLabRoom] = useState<string>(currentAsset?.labRoom || 'PTN Hóa học');
  const [handoverDate, setHandoverDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState<string>('Bàn giao tài sản thiết bị theo kế hoạch phân bổ kỳ nghiên cứu mới');
  const [notes, setNotes] = useState<string>('Thiết bị hoạt động tốt, đầy đủ phụ kiện và tài liệu hướng dẫn kèm theo');

  const [resultTx, setResultTx] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync when asset selection changes
  useEffect(() => {
    if (currentAsset) {
      setLabRoom(currentAsset.labRoom);
      if (currentAsset.manager === recipient) {
        const alt = managers.find(m => m.name !== currentAsset.manager)?.name || managers[0]?.name || 'Đặng Vân Ly';
        setRecipient(alt);
      }
    }
  }, [selectedAssetId, currentAsset, managers]);

  const handoverHistory = transactions.filter(
    tx => tx.type === 'HANDOVER' || tx.type === 'CHANGE_MANAGER'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !currentAsset) return;

    if (currentAsset.manager === recipient) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = handoverAsset(
        currentAsset.id,
        recipient,
        labRoom,
        `${content}. ${notes ? `Ghi chú: ${notes}` : ''}`,
        currentUser?.name
      );
      setIsSubmitting(false);
      if (res.success) {
        setResultTx(res.tx);
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
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bàn giao thiết bị</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Chuyển giao quyền quản lý tài sản và phòng lab, ký xác nhận giao dịch qua Smart Contract'
            : `Theo dõi tình trạng bàn giao và phân công liên quan đến thiết bị do ${currentUser?.name} phụ trách`}
        </p>
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
                <h3 className="text-base font-bold text-slate-800">Bàn giao thiết bị thành công!</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  Đã chuyển quyền phụ trách sang <span className="underline">{recipient}</span> và ghi nhận vào sổ cái.
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
              onClick={() => onNavigate('equipment-detail', { id: currentAsset.id })}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Xem chi tiết thiết bị đã cập nhật
            </button>
            <button
              onClick={() => setResultTx(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              Tiếp tục bàn giao thiết bị khác
            </button>
          </div>
        </div>
      )}

      {/* Handover Form: Only Admin is allowed to change equipment manager */}
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chọn Mã tài sản */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn thiết bị bàn giao <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-medium"
              >
                {assets.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.id} - {item.name} ({item.labRoom})
                  </option>
                ))}
              </select>
            </div>

            {/* Tên thiết bị (auto-fill) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thiết bị</label>
              <input
                type="text"
                disabled
                value={currentAsset?.name || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            {/* Người quản lý hiện tại */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Người phụ trách hiện tại</label>
              <input
                type="text"
                disabled
                value={currentAsset?.manager || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            {/* Người nhận bàn giao */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người nhận bàn giao <span className="text-rose-500">*</span>
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-sky-50/70 border border-sky-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-semibold"
              >
                {managers
                  .filter(m => m.name !== currentAsset?.manager)
                  .map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.userRole === 'admin' ? 'Quản trị viên' : 'Người quản lý'})
                    </option>
                  ))}
              </select>
            </div>

            {/* Phòng thí nghiệm đích */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng thí nghiệm tiếp nhận</label>
              <select
                value={labRoom}
                onChange={(e) => setLabRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              >
                <option value="PTN Sinh học">PTN Sinh học</option>
                <option value="PTN Hóa học">PTN Hóa học</option>
                <option value="PTN Hóa lý">PTN Hóa lý</option>
                <option value="PTN Vi sinh">PTN Vi sinh</option>
                <option value="PTN Vật liệu Nano">PTN Vật liệu Nano</option>
              </select>
            </div>

            {/* Ngày bàn giao */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bàn giao</label>
              <input
                type="date"
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>
          </div>

          {/* Nội dung bàn giao */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung bàn giao <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="VD: Bàn giao quyền quản lý tài sản theo kế hoạch nghiên cứu học kỳ II"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú kèm theo</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tình trạng phụ kiện, cáp nguồn, hóa chất hiệu chuẩn..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 resize-none"
            />
          </div>

          {/* Ký giao dịch */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Phê duyệt & Ký bàn giao trên Blockchain</span>
              <span className="text-slate-500">Xác thực bởi Quản trị viên đang đăng nhập</span>
            </div>
            <span className="font-semibold text-sky-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
              {currentUser?.name} (Quản trị viên)
            </span>
          </div>

          {/* Buttons */}
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
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang ký giao dịch...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Xác nhận bàn giao</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Chế độ theo dõi bàn giao dành cho Người quản lý thiết bị</div>
            <p className="text-sky-800 leading-relaxed">
              Theo quy định phân quyền, Người quản lý không được tự ý thay đổi người phụ trách thiết bị. Dưới đây là danh sách các thiết bị bạn đang phụ trách và lịch sử bàn giao liên quan.
            </p>
          </div>
        </div>
      )}

      {/* Handover History Table (Visible to both Admin and Manager, filtered by accessible assets) */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Lịch sử bàn giao & phân công thiết bị ({handoverHistory.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Mã Asset</th>
                <th className="py-3 px-4">Tên thiết bị</th>
                <th className="py-3 px-4">Chuyển giao phụ trách</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4 text-right">Biên lai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {handoverHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có lịch sử bàn giao nào liên quan đến thiết bị phụ trách.
                  </td>
                </tr>
              ) : (
                handoverHistory.map(tx => (
                  <tr key={tx.txHash} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      {tx.assetId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {tx.assetName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="text-slate-500">{tx.details?.previousManager || 'Hệ thống'}</span>
                      <span className="mx-1.5 text-emerald-600 font-bold">→</span>
                      <strong className="text-emerald-800">{tx.details?.newManager || tx.recipient}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tx.operator}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveTxModal(tx)}
                        className="text-sky-600 hover:text-sky-700 font-semibold text-[11px]"
                      >
                        Khối #{tx.blockNumber}
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
