import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  Cpu, 
  Copy, 
  Check, 
  Eye, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { BlockchainTransaction, TransactionType } from '../types';

interface TransactionHistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenContract?: () => void;
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ 
  onNavigate,
  onOpenContract 
}) => {
  const { transactions, setActiveTxModal, blockNumber, contractAddress } = useBlockchain();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredTxs = transactions.filter(tx => {
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    const matchSearch = 
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getBadgeForType = (type: TransactionType) => {
    switch (type) {
      case 'CREATE_ASSET':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded">CREATE_ASSET</span>;
      case 'HANDOVER':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">HANDOVER</span>;
      case 'BORROW':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">BORROW</span>;
      case 'RETURN':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded">RETURN</span>;
      case 'MAINTENANCE':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">MAINTENANCE</span>;
      case 'CHANGE_MANAGER':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">CHANGE_MANAGER</span>;
      case 'UPDATE_ASSET':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded">UPDATE_ASSET</span>;
      case 'DEACTIVATE_ASSET':
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">DEACTIVATE_ASSET</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 text-slate-700 rounded">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sổ cái khai thác giao dịch Smart Contract LabAssetManager · Toàn vẹn & bất biến
          </p>
        </div>

        {onOpenContract && (
          <button
            onClick={onOpenContract}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs self-start sm:self-auto"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Xem mã Smart Contract Solidity</span>
          </button>
        )}
      </div>

      {/* Network Overview Card */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-indigo-50 border border-sky-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-sky-200 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800">LabChain EVM Local Testnet (Demo Blockchain)</div>
            <div className="text-slate-500 font-mono text-[11px]">Hợp đồng: {contractAddress}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Khối mới nhất</span>
            <span className="font-mono font-bold text-slate-800 text-sm">#{blockNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Tổng số giao dịch</span>
            <span className="font-mono font-bold text-sky-700 text-sm">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo TxHash, mã tài sản, tên thiết bị, người thực hiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
          >
            <option value="all">Tất cả loại giao dịch</option>
            <option value="CREATE_ASSET">CREATE_ASSET</option>
            <option value="HANDOVER">HANDOVER</option>
            <option value="BORROW">BORROW</option>
            <option value="RETURN">RETURN</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="CHANGE_MANAGER">CHANGE_MANAGER</option>
            <option value="UPDATE_ASSET">UPDATE_ASSET</option>
            <option value="DEACTIVATE_ASSET">DEACTIVATE_ASSET</option>
          </select>
        </div>
      </div>

      {/* Transactions Table as requested */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Loại giao dịch</th>
                <th className="py-3.5 px-4">Mã tài sản</th>
                <th className="py-3.5 px-4">Thiết bị</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Transaction Hash</th>
                <th className="py-3.5 px-4">Block</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                filteredTxs.map(tx => (
                  <tr key={tx.txHash} className="hover:bg-sky-50/40 transition-colors">
                    {/* Thời gian */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {tx.timestamp}
                    </td>

                    {/* Loại giao dịch */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getBadgeForType(tx.type)}
                    </td>

                    {/* Mã tài sản */}
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      <span 
                        onClick={() => onNavigate('equipment-detail', { id: tx.assetId })}
                        className="hover:underline cursor-pointer"
                      >
                        {tx.assetId}
                      </span>
                    </td>

                    {/* Thiết bị */}
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap max-w-xs truncate">
                      {tx.assetName}
                    </td>

                    {/* Người thực hiện */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {tx.operator}
                    </td>

                    {/* Transaction Hash (hiển thị rút gọn e.g. 0x82d4...9a31) */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="select-all">
                          {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyHash(tx.txHash)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Sao chép toàn bộ TxHash"
                        >
                          {copiedHash === tx.txHash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Block */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      #{tx.blockNumber}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SUCCESS
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveTxModal(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số giao dịch: <strong>{filteredTxs.length}</strong></span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Mã băm SHA-256 bảo đảm tính bất biến
          </span>
        </div>
      </div>
    </div>
  );
};
