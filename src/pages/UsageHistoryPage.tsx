import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  Search, 
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface UsageHistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const UsageHistoryPage: React.FC<UsageHistoryPageProps> = ({ onNavigate }) => {
  const { timelineEvents, transactions, setActiveTxModal, assets } = useBlockchain();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = timelineEvents.filter(event => {
    const matchType = filterType === 'all' || event.type === filterType;
    const matchSearch = 
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.txHash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch sử sử dụng thiết bị</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dòng thời gian toàn diện ghi nhận mọi biến động tài sản qua các block trên sổ cái Blockchain
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo thiết bị, người thực hiện, nội dung hoặc TxHash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE_ASSET">Tạo asset</option>
            <option value="HANDOVER">Bàn giao</option>
            <option value="BORROW">Mượn thiết bị</option>
            <option value="RETURN">Trả thiết bị</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="CHANGE_MANAGER">Thay đổi quản lý</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="p-6 md:p-8 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Không tìm thấy sự kiện nào trong lịch sử phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-500 group-hover:scale-125 transition-transform shadow-xs"></div>

                <div className="p-5 rounded-2xl bg-slate-50/80 hover:bg-sky-50/30 border border-slate-200/70 hover:border-sky-200 transition-all text-xs space-y-3">
                  {/* Top Bar: Timestamp and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-semibold text-slate-700">
                        {event.date} - {event.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Trạng thái: {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Main Event Title */}
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{event.action}</h3>
                    <p className="text-slate-600 mt-1 leading-relaxed">{event.content}</p>
                  </div>

                  {/* Key metadata grid as requested */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Người thực hiện:</span>
                      <strong className="text-slate-800 font-semibold">{event.operator}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Thiết bị:</span>
                      <div 
                        onClick={() => onNavigate('equipment-detail', { id: event.assetId })}
                        className="font-semibold text-sky-700 hover:underline cursor-pointer truncate"
                      >
                        {event.assetName} ({event.assetId})
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Khối (Block):</span>
                      <strong className="font-mono text-slate-800 font-bold">#{event.blockNumber}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Transaction Hash:</span>
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <span className="truncate max-w-[90px]">{event.txHash.slice(0, 10)}...</span>
                        <button
                          onClick={() => copyHash(event.txHash)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Sao chép TxHash"
                        >
                          {copiedHash === event.txHash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const tx = transactions.find(t => t.txHash === event.txHash);
                            if (tx) setActiveTxModal(tx);
                          }}
                          className="text-sky-600 hover:text-sky-700 p-0.5"
                          title="Xem biên lai"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
