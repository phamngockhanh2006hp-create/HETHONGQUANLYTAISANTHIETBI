import React, { useState } from 'react';
import { Search, Bell, X, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useBlockchain } from '../blockchain/blockchainContext';

interface HeaderProps {
  onSearchSubmit: (query: string) => void;
  onNavigate: (page: string) => void;
  onOpenContract?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchSubmit, onNavigate, onOpenContract }) => {
  const { blockNumber, transactions, setActiveTxModal, currentUser, isAdmin, logout } = useBlockchain();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
      onNavigate('lookup');
    }
  };

  const recentTxs = transactions.slice(0, 4);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()
    : 'QT';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={isAdmin ? "Tìm thiết bị, mã tài sản, người quản lý..." : "Tìm thiết bị thuộc phạm vi phụ trách..."}
          className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
        />
      </form>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-4 ml-4">
        {/* Blockchain Node / Block status badge */}
        <div 
          onClick={onOpenContract}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50/70 border border-sky-100 hover:border-sky-300 text-sky-800 cursor-pointer transition-colors"
          title="Bấm để xem Smart Contract LabAssetManager.sol"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-700">Demo Blockchain</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-mono font-medium text-sky-700 tabular-nums">Khối #{blockNumber}</span>
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Thông báo hoạt động blockchain"
          >
            <Bell className="w-5 h-5" />
            {recentTxs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Giao dịch Blockchain gần nhất</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {recentTxs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Chưa có giao dịch nào đối với thiết bị phụ trách.
                  </div>
                ) : (
                  recentTxs.map(tx => (
                    <div 
                      key={tx.txHash}
                      onClick={() => {
                        setActiveTxModal(tx);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-sky-50/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-sky-700">{tx.eventName}</span>
                        <span className="font-mono">Khối #{tx.blockNumber}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{tx.assetName} ({tx.assetId})</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span>Bởi: {tx.operator}</span>
                        <span className="font-mono truncate max-w-[100px]">{tx.txHash.slice(0, 10)}...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate(isAdmin ? 'transaction-history' : 'usage-history');
                  }}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  {isAdmin ? 'Xem toàn bộ sổ cái giao dịch →' : 'Xem lịch sử sử dụng thiết bị →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentUser?.avatarColor || 'from-sky-400 to-indigo-500'} text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white shrink-0`}>
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              {isAdmin ? (
                <span className="text-sky-700 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Quản trị viên
                </span>
              ) : (
                <span className="text-teal-700 font-medium flex items-center gap-0.5">
                  <UserCheck className="w-3 h-3" />
                  Người quản lý thiết bị
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
