import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  ArrowLeftRight, 
  Repeat, 
  Wrench, 
  Users, 
  QrCode, 
  Clock, 
  Search, 
  Cpu, 
  Settings,
  FileCode,
  FlaskConical,
  LogOut
} from 'lucide-react';
import { useBlockchain } from '../blockchain/blockchainContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenContract?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onOpenContract }) => {
  const { isAdmin, logout } = useBlockchain();

  const allMenuItems = [
    { id: 'home', label: 'Trang chủ', icon: LayoutDashboard, adminOnly: false },
    { id: 'create-asset', label: 'Tạo asset', icon: PlusCircle, adminOnly: true },
    { id: 'equipment-list', label: 'Danh sách thiết bị', icon: Layers, adminOnly: false },
    { id: 'handover', label: 'Bàn giao', icon: ArrowLeftRight, adminOnly: false },
    { id: 'borrow-return', label: 'Mượn / Trả', icon: Repeat, adminOnly: false },
    { id: 'maintenance', label: 'Bảo trì', icon: Wrench, adminOnly: false },
    { id: 'managers', label: 'Người quản lý', icon: Users, adminOnly: true },
    { id: 'qr-code', label: 'QR thiết bị', icon: QrCode, adminOnly: false },
    { id: 'usage-history', label: 'Lịch sử sử dụng', icon: Clock, adminOnly: false },
    { id: 'lookup', label: 'Tra cứu', icon: Search, adminOnly: false },
    { id: 'transaction-history', label: 'Lịch sử giao dịch', icon: Cpu, adminOnly: false },
    { id: 'settings', label: 'Cài đặt', icon: Settings, adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 shrink-0 bg-white/95 backdrop-blur-md border-r border-slate-200/80 min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-teal-400 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-extrabold text-slate-800 leading-tight">
                HỆ THỐNG QUẢN LÝ
              </div>
              <div className="text-sm font-bold text-sky-700 leading-tight mt-0.5">
                TÀI SẢN THIẾT BỊ
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-sky-100 text-sky-800 font-semibold shadow-xs border-l-4 border-sky-600 pl-3'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info & Smart Contract quick access */}
      <div className="space-y-2 p-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-teal-50 to-indigo-50/50 border border-sky-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-semibold text-slate-700">LabChain EVM</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Mô hình sổ cái bảo chứng vòng đời thiết bị phòng lab.
          </p>
          {onOpenContract && (
            <button
              onClick={onOpenContract}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200/80 rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Mã Smart Contract</span>
            </button>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất hệ thống</span>
        </button>
      </div>
    </aside>
  );
};
