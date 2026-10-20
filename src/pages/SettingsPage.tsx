import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  Settings, 
  Cpu, 
  RotateCcw, 
  FileCode, 
  Check, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Database
} from 'lucide-react';

interface SettingsPageProps {
  onOpenContract?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenContract }) => {
  const { network, contractAddress, blockNumber, resetToDefaults } = useBlockchain();
  const [resetDone, setResetDone] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu cho đồ án Blockchain?')) {
      resetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  const copyContractAddr = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cấu hình môi trường thử nghiệm Blockchain và quản lý trạng thái sổ cái LabChain
        </p>
      </div>

      {resetDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Đã đặt lại dữ liệu ban đầu thành công!</span>
        </div>
      )}

      {/* Blockchain Node Settings Card */}
      <div className="p-6 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Thông số Blockchain Node (EVM Testnet)</h3>
              <p className="text-xs text-slate-500">Mạng thử nghiệm phục vụ bảo vệ đồ án Công nghệ Blockchain</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Node Trực Tuyến
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 block mb-1">Mạng kết nối</span>
            <span className="font-semibold text-slate-800">{network}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 block mb-1">Chiều cao khối hiện tại (Block Height)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">#{blockNumber}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 block mb-1">Cơ chế đồng thuận (Consensus)</span>
            <span className="font-semibold text-slate-800">Proof of Authority (PoA - Quản trị viên phòng Lab)</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 block mb-1">Thời gian tạo khối (Block Time)</span>
            <span className="font-semibold text-slate-800">Tức thì khi ký giao dịch (Zero-latency instant finality)</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Địa chỉ Smart Contract đã deploy</span>
            <button
              onClick={copyContractAddr}
              className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"
            >
              {copiedContract ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedContract ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
          <div className="font-mono font-medium text-slate-800 bg-white p-2 rounded-lg border border-slate-200 truncate select-all">
            {contractAddress}
          </div>
        </div>

        {onOpenContract && (
          <div className="pt-2">
            <button
              onClick={onOpenContract}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileCode className="w-4 h-4" />
              <span>Xem toàn bộ mã hợp đồng thông minh LabAssetManager.sol</span>
            </button>
          </div>
        )}
      </div>

      {/* Demo Workflow & Instructions */}
      <div className="p-6 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <span>Trình tự kịch bản Demo hoàn chỉnh cho giảng viên / hội đồng</span>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
          <li><strong>Tạo asset mới:</strong> Nhập mã tài sản mới (TS009), chọn người quản lý, ký giao dịch Smart Contract.</li>
          <li><strong>Xem trong Danh sách thiết bị:</strong> Kiểm tra trạng thái "Sẵn sàng" và các bộ lọc tìm kiếm.</li>
          <li><strong>Bàn giao thiết bị:</strong> Chuyển quyền quản lý sang cán bộ khác và kiểm tra TxHash phát sinh.</li>
          <li><strong>Mượn thiết bị:</strong> Chuyển trạng thái sang "Đang được mượn", ghi nhận người mượn và mục đích.</li>
          <li><strong>Trả thiết bị:</strong> Xác nhận nghiệm thu và trả thiết bị về trạng thái "Sẵn sàng".</li>
          <li><strong>Gửi bảo trì & Hoàn tất:</strong> Tạo phiếu bảo dưỡng kỹ thuật và nghiệm thu hoàn thành.</li>
          <li><strong>Tem mã QR:</strong> Xem mã QR riêng cho từng thiết bị, tải ảnh hoặc in tem dán.</li>
          <li><strong>Quét QR:</strong> Mô phỏng camera scanner để tìm nhanh chi tiết thiết bị.</li>
          <li><strong>Lịch sử sử dụng & Giao dịch:</strong> Xem timeline dọc và tra cứu Transaction Hash, Block Number.</li>
        </ol>
      </div>

      {/* Reset Data card */}
      <div className="p-6 bg-white/95 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <Database className="w-4 h-4" />
          <span>Đặt lại dữ liệu Demo ban đầu</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Xóa các tài sản và giao dịch đã tạo mới trong phiên làm việc, khôi phục lại 8 thiết bị mẫu ban đầu (TS001 - TS008) theo đúng kịch bản đề tài.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục dữ liệu mẫu ban đầu</span>
        </button>
      </div>
    </div>
  );
};
