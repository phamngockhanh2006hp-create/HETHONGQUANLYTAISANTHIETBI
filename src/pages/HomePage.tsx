import React from 'react';
import { 
  Package, 
  Activity, 
  Wrench, 
  Cpu, 
  PlusCircle, 
  ArrowLeftRight, 
  BookOpen, 
  CheckCircle2, 
  QrCode, 
  Microscope, 
  FlaskRound as Flask, 
  Atom, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { StatusBadge } from '../components/StatusBadge';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenQRScanner: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenQRScanner }) => {
  const { assets, transactions, blockNumber, setActiveTxModal, currentUser, isAdmin } = useBlockchain();

  // Dynamic statistics based on logged-in user's accessible assets & transactions
  const activeAssets = assets.filter(a => a.status !== 'stopped');
  const totalAssetsCount = activeAssets.length;
  const usingCount = activeAssets.filter(a => a.status === 'using' || a.status === 'borrowed').length;
  const maintenanceCount = activeAssets.filter(a => a.status === 'maintenance').length;
  const totalTxCount = transactions.length;

  const statCards = [
    {
      title: isAdmin ? 'Tổng số tài sản' : 'Thiết bị phụ trách',
      count: totalAssetsCount,
      desc: isAdmin 
        ? 'Tài sản thiết bị đang hoạt động trong hệ thống' 
        : `Thiết bị được phân công cho ${currentUser?.name}`,
      icon: Package,
      bgIcon: 'bg-sky-50 text-sky-600',
      border: 'border-sky-100',
    },
    {
      title: 'Đang sử dụng / Mượn',
      count: usingCount,
      desc: 'Thiết bị đang vận hành hoặc đang được mượn',
      icon: Activity,
      bgIcon: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      title: 'Đang bảo trì',
      count: maintenanceCount,
      desc: 'Thiết bị đang căn chỉnh, bảo dưỡng kỹ thuật',
      icon: Wrench,
      bgIcon: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    {
      title: isAdmin ? 'Giao dịch hệ thống' : 'Giao dịch liên quan',
      count: totalTxCount,
      desc: 'Bản ghi lịch sử đã xác thực trên Blockchain',
      icon: Cpu,
      bgIcon: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
  ];

  const allQuickActions = [
    {
      label: '+ Tạo asset mới',
      desc: 'Đăng ký thiết bị & tạo mã QR',
      page: 'create-asset',
      icon: PlusCircle,
      bg: 'bg-sky-50/80 hover:bg-sky-100 text-sky-800 border-sky-200/80',
      iconColor: 'text-sky-600',
      adminOnly: true,
    },
    {
      label: isAdmin ? 'Bàn giao thiết bị' : 'Theo dõi bàn giao',
      desc: isAdmin ? 'Chuyển giao quyền quản lý' : 'Xem thông tin bàn giao',
      page: 'handover',
      icon: ArrowLeftRight,
      bg: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80',
      iconColor: 'text-emerald-600',
      adminOnly: false,
    },
    {
      label: 'Mượn thiết bị',
      desc: 'Ghi nhận người mượn sử dụng',
      page: 'borrow-return',
      params: { tab: 'borrow' },
      icon: BookOpen,
      bg: 'bg-purple-50/80 hover:bg-purple-100 text-purple-800 border-purple-200/80',
      iconColor: 'text-purple-600',
      adminOnly: false,
    },
    {
      label: 'Trả thiết bị',
      desc: 'Thu hồi về trạng thái sẵn sàng',
      page: 'borrow-return',
      params: { tab: 'return' },
      icon: CheckCircle2,
      bg: 'bg-teal-50/80 hover:bg-teal-100 text-teal-800 border-teal-200/80',
      iconColor: 'text-teal-600',
      adminOnly: false,
    },
    {
      label: 'Bảo trì thiết bị',
      desc: 'Theo dõi & yêu cầu bảo dưỡng',
      page: 'maintenance',
      icon: Wrench,
      bg: 'bg-amber-50/80 hover:bg-amber-100 text-amber-800 border-amber-200/80',
      iconColor: 'text-amber-600',
      adminOnly: false,
    },
    {
      label: 'Quét QR',
      desc: 'Tra cứu nhanh bằng camera',
      action: onOpenQRScanner,
      icon: QrCode,
      bg: 'bg-cyan-50/80 hover:bg-cyan-100 text-cyan-800 border-cyan-200/80',
      iconColor: 'text-cyan-600',
      adminOnly: false,
    },
  ];

  const quickActions = allQuickActions.filter(a => !a.adminOnly || isAdmin);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner with light lab background motifs */}
      <div className="relative overflow-hidden p-7 rounded-3xl bg-gradient-to-r from-sky-50/90 via-teal-50/60 to-purple-50/70 border border-sky-100/90 shadow-xs">
        {/* Subtle background abstract lab shapes */}
        <div className="absolute right-4 -top-6 text-sky-200/40 pointer-events-none">
          <Microscope className="w-48 h-48 stroke-1" />
        </div>
        <div className="absolute right-48 -bottom-8 text-teal-200/35 pointer-events-none">
          <Flask className="w-36 h-36 stroke-1" />
        </div>
        <div className="absolute right-96 -top-4 text-purple-200/30 pointer-events-none">
          <Atom className="w-28 h-28 stroke-1" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-sky-200/60 text-sky-800 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            Hệ thống Quản lý Tài sản Thiết bị · {isAdmin ? 'Quyền Quản trị viên' : 'Quyền Người quản lý thiết bị'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Xin chào, {currentUser?.name}!
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {isAdmin
              ? 'Bạn đang đăng nhập với quyền Quản trị viên. Bạn có toàn quyền quản lý tài sản, phân công thiết bị cho người quản lý và phê duyệt các yêu cầu trên mạng Blockchain.'
              : `Bạn đang đăng nhập với vai trò Người quản lý thiết bị (${currentUser?.department}). Trang chủ hiện đang thống kê ${totalAssetsCount} thiết bị thuộc phạm vi phụ trách trực tiếp của bạn.`}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sổ cái bảo chứng
            </span>
            <span aria-hidden="true">·</span>
            <span>Khối hiện tại: <strong className="font-mono text-sky-700">#{blockNumber}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Trạng thái mạng: <strong className="text-emerald-600">Đang hoạt động</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white/90 border ${card.border} shadow-xs hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl ${card.bgIcon} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold font-mono text-slate-800 tabular-nums">
                {card.count}
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Các thao tác nhanh
          </h2>
          <span className="text-xs text-slate-400">Chọn tác vụ để tương tác với tài sản</span>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-3`}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (action.action) {
                    action.action();
                  } else if (action.page) {
                    onNavigate(action.page, action.params);
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all hover:-translate-y-0.5 shadow-xs ${action.bg}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/80 shadow-xs flex items-center justify-center mb-2">
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-1">{action.label}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{action.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Devices and Recent Blockchain Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device showcase list (2 cols) - NO equipment images */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isAdmin ? 'Danh mục thiết bị trong phòng Lab' : 'Thiết bị thuộc phạm vi phụ trách'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdmin ? 'Tất cả thiết bị phân bổ theo phòng nghiên cứu' : `Các thiết bị do ${currentUser?.name} trực tiếp quản lý`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('equipment-list')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Xem tất cả ({activeAssets.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeAssets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Hiện chưa có thiết bị nào được phân công phụ trách.
              </div>
            ) : (
              activeAssets.slice(0, 5).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onNavigate('equipment-detail', { id: item.id })}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {item.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.category} · <span className="font-medium text-slate-700">{item.labRoom}</span> · Phụ trách: <span className="text-slate-700 font-medium">{item.manager}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Blockchain Activity (1 col) */}
        <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Sổ cái Blockchain</h3>
              <p className="text-xs text-slate-500">
                {isAdmin ? 'Các giao dịch xác nhận gần đây' : 'Giao dịch của thiết bị phụ trách'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('transaction-history')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Toàn bộ
            </button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có giao dịch nào liên quan.
              </div>
            ) : (
              transactions.slice(0, 4).map((tx) => (
                <div
                  key={tx.txHash}
                  onClick={() => setActiveTxModal(tx)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/70 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-sky-700">{tx.eventName}</span>
                    <span>Khối #{tx.blockNumber}</span>
                  </div>
                  <div className="font-semibold text-slate-800 truncate">{tx.assetName} ({tx.assetId})</div>
                  <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                    <span>Bởi: {tx.operator}</span>
                    <span className="font-mono text-slate-400">{tx.txHash.slice(0, 10)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('usage-history')}
              className="w-full py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Xem dòng thời gian vòng đời thiết bị →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
