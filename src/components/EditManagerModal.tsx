import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { ManagerProfile } from '../types';
import { X, Pencil, Lock, User } from 'lucide-react';

interface EditManagerModalProps {
  manager: ManagerProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const FIXED_ADMINS = ['Phạm Ngọc Khánh', 'Đặng Vân Ly', 'Nguyễn Khánh Ngọc'];

export const EditManagerModal: React.FC<EditManagerModalProps> = ({
  manager,
  isOpen,
  onClose
}) => {
  const { updateManager, isAdmin } = useBlockchain();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarColor, setAvatarColor] = useState('from-sky-400 to-indigo-500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (manager) {
      setName(manager.name);
      setUsername(manager.username || '');
      setNewPassword('');
      setRole(manager.role);
      setEmail(manager.email);
      setPhone(manager.phone);
      setDepartment(manager.department);
      setAvatarColor(manager.avatarColor);
    }
  }, [manager]);

  if (!isOpen || !manager || !isAdmin) return null;

  const isFixedAdmin = FIXED_ADMINS.includes(manager.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await updateManager(manager.name, {
      name: name.trim(),
      username: username.trim(),
      newPassword: newPassword.trim() || undefined,
      role: role.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      avatarColor
    });
    setIsSubmitting(false);
    onClose();
  };

  const colorOptions = [
    { label: 'Xanh dương & Chàm', value: 'from-sky-400 to-indigo-500' },
    { label: 'Ngọc lục bảo & Teal', value: 'from-emerald-400 to-teal-600' },
    { label: 'Tím lavender', value: 'from-violet-400 to-purple-600' },
    { label: 'Cam san hô & Hồng', value: 'from-amber-400 to-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Chỉnh sửa thông tin tài khoản</h3>
              <p className="text-xs text-slate-500">{manager.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isFixedAdmin}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
            />
            {isFixedAdmin && (
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Họ tên của 3 tài khoản Quản trị viên cố định được bảo vệ.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên đăng nhập <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đổi mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Để trống nếu giữ nguyên"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Vai trò / Chức danh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Khoa / Viện / Bộ phận
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Màu sắc biểu tượng</label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setAvatarColor(opt.value)}
                  className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2 ${
                    avatarColor === opt.value
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${opt.value} shadow-xs`}></div>
                  <span className="text-[11px] text-slate-700 font-medium truncate">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
