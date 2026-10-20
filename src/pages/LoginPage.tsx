import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  FlaskConical, 
  Lock, 
  User, 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  Microscope, 
  FlaskRound as Flask, 
  Atom 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users } = useBlockchain();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xác thực đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const managerUsers = users.filter(u => u.role === 'manager');

  return (
    <div className="min-h-screen bg-lab-pattern flex flex-col justify-center items-center p-4 selection:bg-sky-200 selection:text-sky-900 relative overflow-hidden">
      {/* Background Decorative Faint Lab Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <Atom className="absolute top-16 right-1/4 w-64 h-64 text-sky-200/40 stroke-1 transform rotate-12" />
        <Microscope className="absolute bottom-16 left-24 w-56 h-56 text-teal-200/35 stroke-1" />
        <Flask className="absolute top-2/3 right-16 w-48 h-48 text-indigo-200/30 stroke-1" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in duration-200">
        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-sky-50/90 via-teal-50/60 to-indigo-50/60 border-b border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-md mb-4">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div className="text-[11px] uppercase tracking-widest font-extrabold text-sky-700">
              HỆ THỐNG QUẢN LÝ TÀI SẢN THIẾT BỊ
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              ĐĂNG NHẬP HỆ THỐNG
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Xác thực quyền truy cập sổ cái thiết bị phòng thí nghiệm
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên tài khoản
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc họ và tên..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 text-slate-800 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 text-slate-800 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Mật khẩu được mã hóa băm SHA-256 an toàn</span>
            </div>
          </form>
        </div>

        {/* Account Reference Guide (Text only, no quick switch buttons) */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <div className="font-bold text-slate-700 flex items-center justify-between">
            <span>Thông tin tài khoản trong hệ thống</span>
            <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Mật khẩu demo: 123
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1.5">
              <div className="font-semibold text-sky-800 text-[11px] uppercase tracking-wider">
                3 Quản trị viên (Admin)
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                {adminUsers.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{u.name}</span>
                    <code className="text-[10px] text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-100">{u.username}</code>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1.5">
              <div className="font-semibold text-teal-800 text-[11px] uppercase tracking-wider">
                Người quản lý thiết bị ({managerUsers.length})
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 max-h-24 overflow-y-auto">
                {managerUsers.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate mr-1">{u.name}</span>
                    <code className="text-[10px] text-teal-700 bg-white px-1.5 py-0.5 rounded border border-teal-100 shrink-0">{u.username}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
            Lưu ý: Có thể đăng nhập bằng <strong>Tên đăng nhập</strong> (VD: <code className="text-slate-600">phamngockhanh</code>) hoặc <strong>Họ và tên</strong> (VD: <code className="text-slate-600">Phạm Ngọc Khánh</code>). Mật khẩu 123 chỉ sử dụng cho bản demo; khi triển khai thực tế bắt buộc đổi sang mật khẩu mạnh.
          </p>
        </div>
      </div>
    </div>
  );
};
