import React, { useState } from 'react';
import { useBlockchain } from '../blockchain/blockchainContext';
import { 
  Mail, 
  Phone, 
  Building, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  UserPlus,
  CheckSquare,
  Square,
  X,
  UserCheck,
  Lock,
  User,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { ManagerProfile } from '../types';
import { EditManagerModal } from '../components/EditManagerModal';
import { StatusBadge } from '../components/StatusBadge';

interface ManagersPageProps {
  onNavigate: (page: string, params?: any) => void;
}

const FIXED_ADMIN_NAMES = ['Phạm Ngọc Khánh', 'Đặng Vân Ly', 'Nguyễn Khánh Ngọc'];

export const ManagersPage: React.FC<ManagersPageProps> = ({ onNavigate }) => {
  const { allAssets, managers, deleteManager, createManagerAccount, assignMultipleAssets, addToast, isAdmin } = useBlockchain();
  const [editingManager, setEditingManager] = useState<ManagerProfile | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Create Manager Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newTitle, setNewTitle] = useState('Quản lý Thiết bị Phòng Thí nghiệm');
  const [newDepartment, setNewDepartment] = useState('Viện Công nghệ Sinh học');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newColor, setNewColor] = useState('from-cyan-400 to-sky-600');
  const [createError, setCreateError] = useState('');

  // Assign Equipment Modal State
  const [assignModalManager, setAssignModalManager] = useState<ManagerProfile | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState('Phân công phụ trách thiết bị theo kế hoạch quản lý tài sản');

  // Block unauthorized access if accessed directly by URL/state
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Không có quyền truy cập</h2>
        <p className="text-xs text-slate-600">
          Người quản lý không được phép xem danh sách tài khoản hệ thống hoặc tự ý thay đổi phân công người phụ trách.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const activeEquipment = allAssets.filter(a => a.status !== 'stopped');

  const getManagedDevices = (name: string) => {
    return activeEquipment.filter(a => a.manager === name);
  };

  const handleOpenAssignModal = (manager: ManagerProfile) => {
    setAssignModalManager(manager);
    const currentlyManaged = activeEquipment.filter(a => a.manager === manager.name).map(a => a.id);
    setSelectedAssetIds(currentlyManaged);
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalManager) return;

    // Find assets newly checked that weren't previously managed by this manager
    const newlyAssignedIds = selectedAssetIds.filter(id => {
      const asset = activeEquipment.find(a => a.id === id);
      return asset && asset.manager !== assignModalManager.name;
    });

    if (newlyAssignedIds.length === 0) {
      addToast('Không có thiết bị mới nào được chọn thêm để chuyển sang người quản lý này.', 'info');
      setAssignModalManager(null);
      return;
    }

    assignMultipleAssets(newlyAssignedIds, assignModalManager.name, assignNotes);
    setAssignModalManager(null);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const res = await createManagerAccount({
      username: newUsername,
      password: newPassword || '123',
      name: newName,
      title: newTitle,
      email: newEmail,
      phone: newPhone,
      department: newDepartment,
      avatarColor: newColor
    });

    if (!res.success) {
      setCreateError(res.message);
      return;
    }

    setShowCreateModal(false);
    setNewName('');
    setNewUsername('');
    setNewPassword('123');
    setNewEmail('');
    setNewPhone('');
  };

  const handleDelete = (manager: ManagerProfile) => {
    if (FIXED_ADMIN_NAMES.includes(manager.name)) {
      setDeleteWarning(`Tài khoản "${manager.name}" là Quản trị viên cố định của hệ thống (chỉ có đúng 3 Quản trị viên), không được phép xóa.`);
      return;
    }

    const deviceCount = getManagedDevices(manager.name).length;
    if (deviceCount > 0) {
      setDeleteWarning(
        `Người quản lý ${manager.name} hiện đang phụ trách ${deviceCount} thiết bị. Vui lòng phân công hoặc chuyển thiết bị sang người quản lý khác trước khi xóa.`
      );
      addToast(
        'Người quản lý này hiện đang phụ trách thiết bị. Vui lòng chuyển thiết bị sang người quản lý khác trước khi xóa.',
        'warning'
      );
      return;
    }

    deleteManager(manager.name);
  };

  const adminProfiles = managers.filter(m => m.userRole === 'admin');
  const managerProfiles = managers.filter(m => m.userRole !== 'admin');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Tài khoản & Phân công Thiết bị</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý 3 tài khoản Quản trị viên cố định, tạo thêm tài khoản Người quản lý thiết bị và phân công tài sản phụ trách
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenAssignModal(managerProfiles[0] || adminProfiles[0])}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Phân công thiết bị</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm tài khoản người quản lý</span>
          </button>
        </div>
      </div>

      {deleteWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs animate-in slide-in-from-top-1">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5">Thông báo hệ thống:</strong>
            {deleteWarning}
          </div>
          <button 
            onClick={() => setDeleteWarning(null)} 
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section A: 3 Quản trị viên cố định */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              A. Ban Quản trị viên Hệ thống (Đúng 3 tài khoản cố định)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Toàn quyền quản trị hệ thống & phê duyệt</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminProfiles.map((admin) => {
            const managedList = getManagedDevices(admin.name);
            const initials = admin.name.split(' ').map(n => n[0]).join('').slice(-2);

            return (
              <div
                key={admin.name}
                className="bg-white/95 rounded-2xl border border-sky-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${admin.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-slate-800">{admin.name}</h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 mt-1">
                          <ShieldCheck className="w-3 h-3" />
                          Quản trị viên (Admin)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingManager(admin)}
                      className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                      title="Sửa thông tin liên hệ / mật khẩu"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-medium text-slate-600 mt-3">{admin.role}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{admin.department}</span>

                  <div className="my-4 border-t border-slate-100"></div>

                  {/* Account info (NO password displayed) */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                      <span className="text-slate-400">Tài khoản:</span>
                      <code className="font-mono font-semibold text-sky-700">{admin.username}</code>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate select-all">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{admin.phone}</span>
                    </div>
                  </div>

                  {/* Assigned Equipment List Preview */}
                  <div className="mt-4 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-600" />
                        Thiết bị trực tiếp phụ trách:
                      </span>
                      <span className="font-mono font-bold text-sky-700">{managedList.length}</span>
                    </div>
                    {managedList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {managedList.map(eq => (
                          <span
                            key={eq.id}
                            onClick={() => onNavigate('equipment-detail', { id: eq.id })}
                            className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 rounded cursor-pointer transition-colors"
                            title={eq.name}
                          >
                            {eq.id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssignModal(admin)}
                    className="flex-1 py-2 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 transition-colors"
                  >
                    Phân công TB
                  </button>
                  <button
                    onClick={() => onNavigate('equipment-list', { manager: admin.name })}
                    className="flex-1 py-2 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors border border-sky-200/80"
                  >
                    <span>Danh sách ({managedList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section B: Danh sách Người quản lý thiết bị */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              B. Danh sách Người quản lý thiết bị ({managerProfiles.length} tài khoản)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Chỉ xem và thao tác trên thiết bị được phân công</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managerProfiles.map((manager) => {
            const managedList = getManagedDevices(manager.name);
            const initials = manager.name.split(' ').map(n => n[0]).join('').slice(-2);

            return (
              <div
                key={manager.name}
                className="bg-white/95 rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${manager.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{manager.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 mt-1">
                          Người quản lý thiết bị
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingManager(manager)}
                        className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                        title="Sửa thông tin người quản lý"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(manager)}
                        className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                        title="Xóa tài khoản người quản lý"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-600 mt-3">{manager.role}</p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{manager.department}</span>

                  <div className="my-4 border-t border-slate-100"></div>

                  {/* Contact & Username (NO password shown) */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                      <span className="text-slate-400">Tài khoản:</span>
                      <code className="font-mono font-semibold text-teal-700">{manager.username}</code>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate select-all">{manager.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{manager.phone}</span>
                    </div>
                  </div>

                  {/* Assigned Equipment List */}
                  <div className="mt-4 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        Thiết bị được phân công:
                      </span>
                      <span className="font-mono font-bold text-teal-700">{managedList.length}</span>
                    </div>
                    {managedList.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Chưa có thiết bị nào được phân công</p>
                    ) : (
                      <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                        {managedList.map(eq => (
                          <div
                            key={eq.id}
                            onClick={() => onNavigate('equipment-detail', { id: eq.id })}
                            className="flex items-center justify-between px-2 py-1 text-[11px] bg-white hover:bg-sky-50 rounded border border-slate-200/80 cursor-pointer transition-colors"
                          >
                            <span className="font-mono font-bold text-sky-700">{eq.id}</span>
                            <span className="text-slate-700 truncate ml-2 flex-1">{eq.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssignModal(manager)}
                    className="flex-1 py-2 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 transition-colors"
                  >
                    Phân công thiết bị
                  </button>
                  <button
                    onClick={() => onNavigate('equipment-list', { manager: manager.name })}
                    className="flex-1 py-2 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors border border-sky-200/80"
                  >
                    <span>Xem ({managedList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Tạo tài khoản Người quản lý mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Thêm tài khoản Người quản lý</h3>
                  <p className="text-xs text-slate-500">Tạo tài khoản mới để phân công phụ trách thiết bị</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManager} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {createError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên người quản lý <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newUsername) {
                      const slug = e.target.value
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .toLowerCase()
                        .replace(/\s+/g, '');
                      setNewUsername(slug);
                    }
                  }}
                  placeholder="VD: Hoàng Văn Kiên"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên tài khoản đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="hoangvankien"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Mặc định demo: 123 (Lưu mã băm SHA-256)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chức danh</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khoa / Viện / Phòng thí nghiệm</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="kien@lab.edu.vn"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0905 111 222"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Phân công nhiều thiết bị cho Người quản lý */}
      {assignModalManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-50 to-sky-50 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Phân công thiết bị cho Người quản lý</h3>
                  <p className="text-xs text-slate-500">Chọn một hoặc nhiều thiết bị để gán quyền phụ trách</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalManager(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Chọn người quản lý */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn Người quản lý nhận phân công <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignModalManager.name}
                  onChange={(e) => {
                    const found = managers.find(m => m.name === e.target.value);
                    if (found) {
                      setAssignModalManager(found);
                      setSelectedAssetIds(activeEquipment.filter(a => a.manager === found.name).map(a => a.id));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-sky-50/70 border border-sky-300 rounded-xl text-slate-800 font-semibold"
                >
                  {managers.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} — {m.role} ({m.userRole === 'admin' ? 'Quản trị viên' : 'Người quản lý thiết bị'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Danh sách chọn nhiều thiết bị */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">
                    Chọn các thiết bị phân công cho <span className="text-teal-700 underline">{assignModalManager.name}</span>:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Đang chọn: <strong>{selectedAssetIds.length}</strong> / {activeEquipment.length} thiết bị
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {activeEquipment.map(item => {
                    const isChecked = selectedAssetIds.includes(item.id);
                    const isAlreadyTheirs = item.manager === assignModalManager.name;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleAssetSelection(item.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-700">{item.id}</span>
                              <span className="font-semibold text-slate-800">{item.name}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Vị trí: {item.labRoom} · Người phụ trách hiện tại: <strong className={isAlreadyTheirs ? 'text-teal-700' : 'text-slate-700'}>{item.manager}</strong>
                            </div>
                          </div>
                        </div>

                        {isAlreadyTheirs && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-100 text-teal-800 rounded">
                            Đang phụ trách
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú phân công trên sổ cái Blockchain</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssignModalManager(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận phân công</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      <EditManagerModal
        manager={editingManager}
        isOpen={Boolean(editingManager)}
        onClose={() => setEditingManager(null)}
      />
    </div>
  );
};
