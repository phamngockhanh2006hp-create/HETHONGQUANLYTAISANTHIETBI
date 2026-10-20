import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Equipment, 
  BlockchainTransaction, 
  TimelineEvent, 
  MaintenanceRecord, 
  ManagerName, 
  ManagerProfile, 
  TransactionType,
  ToastMessage,
  UserAccount
} from '../types';
import { 
  INITIAL_EQUIPMENT, 
  INITIAL_TRANSACTIONS, 
  INITIAL_TIMELINE_EVENTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_USERS,
  DEFAULT_PASSWORD_HASH
} from '../data/mockData';

// Helper to hash password using Web Crypto API SHA-256 (with synchronous fallback if needed)
export async function hashPasswordSHA256(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for "123"
  if (password === '123') return DEFAULT_PASSWORD_HASH;
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

interface BlockchainContextType {
  currentUser: UserAccount | null;
  isAdmin: boolean;
  users: UserAccount[];
  login: (usernameOrName: string, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  assets: Equipment[];
  allAssets: Equipment[];
  transactions: BlockchainTransaction[];
  timelineEvents: TimelineEvent[];
  maintenanceRecords: MaintenanceRecord[];
  managers: ManagerProfile[];
  blockNumber: number;
  network: string;
  contractAddress: string;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  activeTxModal: BlockchainTransaction | null;
  setActiveTxModal: (tx: BlockchainTransaction | null) => void;
  createAsset: (data: {
    id: string;
    name: string;
    category: string;
    labRoom: string;
    manager: ManagerName;
    manufacturer: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    price: string;
    description: string;
  }, operator?: string) => { success: boolean; tx: BlockchainTransaction; blockNumber: number };
  updateAsset: (
    assetId: string, 
    updatedFields: Partial<Omit<Equipment, 'id' | 'createdAt'>>, 
    operator?: string
  ) => { success: boolean; message: string; tx?: BlockchainTransaction; blockNumber?: number };
  deleteAsset: (
    assetId: string, 
    reason?: string, 
    operator?: string
  ) => { success: boolean; message: string; tx?: BlockchainTransaction };
  handoverAsset: (
    assetId: string, 
    newManager: ManagerName, 
    labRoom: string, 
    notes: string, 
    operator?: string
  ) => { success: boolean; tx: BlockchainTransaction };
  assignMultipleAssets: (
    assetIds: string[],
    targetManager: ManagerName,
    notes?: string
  ) => { success: boolean; count: number; message: string };
  borrowAsset: (
    assetId: string, 
    borrower: string, 
    purpose: string, 
    expectedReturnDate: string, 
    note?: string, 
    operator?: string
  ) => { success: boolean; tx: BlockchainTransaction };
  returnAsset: (
    assetId: string, 
    returner: string, 
    condition: string, 
    notes?: string, 
    operator?: string
  ) => { success: boolean; tx: BlockchainTransaction };
  createMaintenance: (
    assetId: string, 
    issue: string, 
    description: string, 
    assignee: ManagerName, 
    startDate: string, 
    expectedCompletionDate: string, 
    notes?: string, 
    operator?: string
  ) => { success: boolean; tx: BlockchainTransaction };
  updateMaintenance: (
    maintenanceId: string,
    updatedFields: Partial<MaintenanceRecord>,
    operator?: string
  ) => { success: boolean; message: string };
  cancelMaintenance: (
    maintenanceId: string,
    reason?: string,
    operator?: string
  ) => { success: boolean; message: string };
  completeMaintenance: (
    maintenanceId: string, 
    completedDate: string, 
    notes: string, 
    operator?: string
  ) => { success: boolean; tx: BlockchainTransaction };
  createManagerAccount: (data: {
    username: string;
    password?: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    department: string;
    avatarColor: string;
  }) => Promise<{ success: boolean; message: string }>;
  updateManager: (
    originalName: string,
    updatedData: Partial<ManagerProfile> & { newPassword?: string; username?: string }
  ) => Promise<{ success: boolean; message: string }>;
  deleteManager: (
    name: string
  ) => { success: boolean; message: string };
  getAssetById: (id: string) => Equipment | undefined;
  getAssetTransactions: (assetId: string) => BlockchainTransaction[];
  getAssetTimeline: (assetId: string) => TimelineEvent[];
  resetToDefaults: () => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

function generateHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateTxHash(): string {
  return '0x' + generateHex(64);
}

function getFormattedDateTime(): { formatted: string; date: string; time: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(now.getDate());
  const m = pad(now.getMonth() + 1);
  const y = now.getFullYear();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return {
    formatted: `${d}/${m}/${y} ${hh}:${mm}:${ss}`,
    date: `${d}/${m}/${y}`,
    time: `${hh}:${mm}`
  };
}

const FIXED_ADMIN_NAMES = ['Phạm Ngọc Khánh', 'Đặng Vân Ly', 'Nguyễn Khánh Ngọc'];

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start unauthenticated on initial app open as required:
  // "Khi mở website, màn hình đầu tiên bắt buộc phải là ĐĂNG NHẬP HỆ THỐNG. Không được tự động vào trang chủ khi chưa đăng nhập."
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('lab_blockchain_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [allAssets, setAllAssets] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('lab_blockchain_assets_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_EQUIPMENT;
  });

  const [allTransactions, setAllTransactions] = useState<BlockchainTransaction[]>(() => {
    const saved = localStorage.getItem('lab_blockchain_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [allTimelineEvents, setAllTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('lab_blockchain_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE_EVENTS;
  });

  const [allMaintenanceRecords, setAllMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('lab_blockchain_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [blockNumber, setBlockNumber] = useState<number>(() => {
    const saved = localStorage.getItem('lab_blockchain_block');
    return saved ? parseInt(saved, 10) : 12569;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTxModal, setActiveTxModal] = useState<BlockchainTransaction | null>(null);

  const network = 'LabChain EVM Local Testnet · Chain ID: 1337 (Demo Blockchain)';
  const contractAddress = '0x71C8A3297a7f439E3A5c0932029c298DCE3b1F83';

  const isAdmin = currentUser?.role === 'admin';

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lab_blockchain_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lab_blockchain_assets_v2', JSON.stringify(allAssets));
  }, [allAssets]);

  useEffect(() => {
    localStorage.setItem('lab_blockchain_txs', JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem('lab_blockchain_timeline', JSON.stringify(allTimelineEvents));
  }, [allTimelineEvents]);

  useEffect(() => {
    localStorage.setItem('lab_blockchain_maintenance', JSON.stringify(allMaintenanceRecords));
  }, [allMaintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('lab_blockchain_block', blockNumber.toString());
  }, [blockNumber]);

  // Strict Data-level RBAC Filtering
  const assets = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allAssets;
    return allAssets.filter(a => a.manager === currentUser.name);
  }, [allAssets, currentUser]);

  const allowedAssetIds = useMemo(() => {
    return new Set(assets.map(a => a.id.toLowerCase()));
  }, [assets]);

  const transactions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allTransactions;
    return allTransactions.filter(tx => allowedAssetIds.has(tx.assetId.toLowerCase()));
  }, [allTransactions, currentUser, allowedAssetIds]);

  const timelineEvents = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allTimelineEvents;
    return allTimelineEvents.filter(ev => allowedAssetIds.has(ev.assetId.toLowerCase()));
  }, [allTimelineEvents, currentUser, allowedAssetIds]);

  const maintenanceRecords = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allMaintenanceRecords;
    return allMaintenanceRecords.filter(m => allowedAssetIds.has(m.assetId.toLowerCase()));
  }, [allMaintenanceRecords, currentUser, allowedAssetIds]);

  // Managers list (Managers cannot see admin account list)
  const managers: ManagerProfile[] = useMemo(() => {
    const visibleUsers = currentUser?.role === 'admin'
      ? users
      : users.filter(u => u.role !== 'admin' && u.name === currentUser?.name);
    return visibleUsers.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.title,
      userRole: u.role,
      email: u.email,
      phone: u.phone,
      department: u.department,
      avatarColor: u.avatarColor
    }));
  }, [users, currentUser]);

  // Authentication functions
  const login = async (usernameInput: string, passwordPlain: string): Promise<{ success: boolean; message: string }> => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    if (!trimmedUser || !passwordPlain) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu.' };
    }

    const inputHash = await hashPasswordSHA256(passwordPlain);
    const matchedUser = users.find(
      u => u.username.toLowerCase() === trimmedUser || u.name.toLowerCase() === trimmedUser
    );

    if (!matchedUser || matchedUser.passwordHash !== inputHash) {
      return { success: false, message: 'Tên tài khoản hoặc mật khẩu không chính xác.' };
    }

    setCurrentUser(matchedUser);
    addToast(`Đăng nhập thành công: ${matchedUser.name} (${matchedUser.role === 'admin' ? 'Quản trị viên' : 'Người quản lý thiết bị'})`, 'success');
    return { success: true, message: 'Đăng nhập thành công.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTxModal(null);
    addToast('Đã đăng xuất khỏi hệ thống.', 'info');
  };

  // Asset CRUD with permission checks
  const createAsset = (
    data: {
      id: string;
      name: string;
      category: string;
      labRoom: string;
      manager: ManagerName;
      manufacturer: string;
      model: string;
      serialNumber: string;
      purchaseDate: string;
      price: string;
      description: string;
    },
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền tạo Asset mới.', 'error');
      return { success: false, tx: {} as any, blockNumber };
    }

    const activeOperator = operator || currentUser?.name || 'Phạm Ngọc Khánh';
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();

    const newAsset: Equipment = {
      ...data,
      status: 'available',
      updatedAt: dt.date,
      createdAt: dt.date
    };

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'CREATE_ASSET',
      assetId: data.id,
      assetName: data.name,
      operator: activeOperator,
      recipient: data.manager,
      status: 'SUCCESS',
      eventName: 'AssetCreated',
      gasUsed: 88200 + Math.floor(Math.random() * 5000),
      details: {
        category: data.category,
        labRoom: data.labRoom,
        manager: data.manager,
        serialNumber: data.serialNumber,
        price: data.price
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Tạo asset',
      operator: activeOperator,
      assetId: data.id,
      assetName: data.name,
      content: `Khởi tạo thiết bị ${data.name} (${data.id}) tại ${data.labRoom}, người phụ trách: ${data.manager}.`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'CREATE_ASSET'
    };

    setAllAssets(prev => [newAsset, ...prev]);
    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Tạo asset thành công.', 'success');

    return { success: true, tx: newTx, blockNumber: nextBlock };
  };

  const updateAsset = (
    assetId: string,
    updatedFields: Partial<Omit<Equipment, 'id' | 'createdAt'>>,
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền chỉnh sửa thông tin Asset.', 'error');
      return { success: false, message: 'Không có quyền thực hiện.' };
    }

    const target = allAssets.find(a => a.id === assetId);
    if (!target) {
      addToast('Không tìm thấy thiết bị cần cập nhật.', 'error');
      return { success: false, message: 'Thiết bị không tồn tại.' };
    }

    const activeOperator = operator || currentUser?.name || 'Phạm Ngọc Khánh';
    const dt = getFormattedDateTime();

    const isCriticalChange = 
      (updatedFields.manager && updatedFields.manager !== target.manager) ||
      (updatedFields.status && updatedFields.status !== target.status) ||
      (updatedFields.labRoom && updatedFields.labRoom !== target.labRoom);

    let newTx: BlockchainTransaction | undefined = undefined;
    let nextBlock = blockNumber;

    if (isCriticalChange) {
      nextBlock = blockNumber + 1;
      setBlockNumber(nextBlock);
      const txHash = generateTxHash();

      const changeNotes: string[] = [];
      if (updatedFields.manager && updatedFields.manager !== target.manager) {
        changeNotes.push(`Người phụ trách: ${target.manager} → ${updatedFields.manager}`);
      }
      if (updatedFields.status && updatedFields.status !== target.status) {
        changeNotes.push(`Trạng thái: ${target.status} → ${updatedFields.status}`);
      }
      if (updatedFields.labRoom && updatedFields.labRoom !== target.labRoom) {
        changeNotes.push(`Phòng lab: ${target.labRoom} → ${updatedFields.labRoom}`);
      }

      newTx = {
        txHash,
        blockNumber: nextBlock,
        timestamp: dt.formatted,
        type: 'UPDATE_ASSET',
        assetId: target.id,
        assetName: updatedFields.name || target.name,
        operator: activeOperator,
        recipient: updatedFields.manager || target.manager,
        status: 'SUCCESS',
        eventName: 'AssetUpdated',
        gasUsed: 49800 + Math.floor(Math.random() * 3000),
        details: {
          changes: changeNotes,
          updatedFields
        }
      };

      const newEvent: TimelineEvent = {
        id: 'TL_' + Date.now(),
        timestamp: dt.formatted,
        date: dt.date,
        time: dt.time,
        action: 'Cập nhật thiết bị',
        operator: activeOperator,
        assetId: target.id,
        assetName: updatedFields.name || target.name,
        content: `Cập nhật thông số thiết bị: ${changeNotes.join('; ')}.`,
        txHash,
        blockNumber: nextBlock,
        status: 'Hoàn thành',
        type: 'UPDATE_ASSET'
      };

      setAllTransactions(prev => [newTx!, ...prev]);
      setAllTimelineEvents(prev => [newEvent, ...prev]);
    }

    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          ...updatedFields,
          id: item.id,
          updatedAt: dt.date
        };
      }
      return item;
    }));

    addToast('Cập nhật thiết bị thành công.', 'success');
    return { success: true, message: 'Cập nhật thiết bị thành công.', tx: newTx, blockNumber: nextBlock };
  };

  const deleteAsset = (
    assetId: string,
    reason: string = 'Thiết bị ngừng sử dụng và đưa ra khỏi hoạt động',
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền xóa / ngừng sử dụng Asset.', 'error');
      return { success: false, message: 'Không có quyền thực hiện.' };
    }

    const target = allAssets.find(a => a.id === assetId);
    if (!target) {
      addToast('Không tìm thấy thiết bị để xóa.', 'error');
      return { success: false, message: 'Thiết bị không tồn tại.' };
    }

    if (target.status === 'borrowed') {
      const msg = 'Không thể xóa vì thiết bị đang được mượn. Vui lòng hoàn tất thủ tục trả trước khi xóa.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    if (target.status === 'maintenance') {
      const msg = 'Không thể xóa vì thiết bị đang trong quá trình bảo trì kỹ thuật.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    const activeOperator = operator || currentUser?.name || 'Phạm Ngọc Khánh';
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();

    const deactTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'DEACTIVATE_ASSET',
      assetId: target.id,
      assetName: target.name,
      operator: activeOperator,
      status: 'SUCCESS',
      eventName: 'AssetDeactivated',
      gasUsed: 51200 + Math.floor(Math.random() * 2500),
      details: {
        reason,
        previousStatus: target.status,
        manager: target.manager,
        labRoom: target.labRoom
      }
    };

    const deactEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Ngừng sử dụng / Xóa khỏi hoạt động',
      operator: activeOperator,
      assetId: target.id,
      assetName: target.name,
      content: `Ngừng sử dụng thiết bị và xóa khỏi danh sách hoạt động. Lý do: "${reason}". Toàn bộ lịch sử giao dịch vẫn được lưu giữ bất biến trên Blockchain.`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'DEACTIVATE_ASSET'
    };

    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          status: 'stopped',
          updatedAt: dt.date
        };
      }
      return item;
    }));

    setAllTransactions(prev => [deactTx, ...prev]);
    setAllTimelineEvents(prev => [deactEvent, ...prev]);

    addToast('Đã xóa thiết bị khỏi danh sách hoạt động.', 'success');
    return { success: true, message: 'Đã xóa thiết bị khỏi danh sách hoạt động.', tx: deactTx };
  };

  const handoverAsset = (
    assetId: string, 
    newManager: ManagerName, 
    labRoom: string, 
    notes: string, 
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Người quản lý không được tự ý thay đổi người phụ trách thiết bị. Vui lòng liên hệ Quản trị viên.', 'error');
      return { success: false, tx: {} as any };
    }

    const target = allAssets.find(a => a.id === assetId);
    if (!target) return { success: false, tx: {} as any };

    const activeOperator = operator || currentUser?.name || 'Phạm Ngọc Khánh';
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();
    const oldManager = target.manager;

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'HANDOVER',
      assetId: target.id,
      assetName: target.name,
      operator: activeOperator,
      recipient: newManager,
      status: 'SUCCESS',
      eventName: 'AssetHandedOver',
      gasUsed: 52400 + Math.floor(Math.random() * 4000),
      details: {
        previousManager: oldManager,
        newManager,
        labRoom,
        notes
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Bàn giao thiết bị',
      operator: activeOperator,
      assetId: target.id,
      assetName: target.name,
      content: `Bàn giao quyền quản lý từ ${oldManager} sang ${newManager} tại ${labRoom}. Nội dung: ${notes || 'Bàn giao theo kế hoạch nghiên cứu'}.`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'HANDOVER'
    };

    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          manager: newManager,
          labRoom: labRoom || item.labRoom,
          updatedAt: dt.date
        };
      }
      return item;
    }));

    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Bàn giao thiết bị thành công.', 'success');

    return { success: true, tx: newTx };
  };

  // Multi-asset assignment for Admin
  const assignMultipleAssets = (
    assetIds: string[],
    targetManager: ManagerName,
    notes: string = 'Phân công phụ trách thiết bị bởi Quản trị viên'
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền phân công thiết bị.', 'error');
      return { success: false, count: 0, message: 'Không có quyền thực hiện.' };
    }

    const validTargets = allAssets.filter(a => assetIds.includes(a.id) && a.manager !== targetManager);
    if (validTargets.length === 0) {
      addToast('Các thiết bị đã chọn hiện đã thuộc quyền quản lý của người này.', 'info');
      return { success: false, count: 0, message: 'Không có thay đổi.' };
    }

    const dt = getFormattedDateTime();
    const activeOperator = currentUser?.name || 'Phạm Ngọc Khánh';
    let currentBlk = blockNumber;
    const newTxs: BlockchainTransaction[] = [];
    const newEvents: TimelineEvent[] = [];

    validTargets.forEach((target, idx) => {
      currentBlk += 1;
      const txHash = generateTxHash();
      const oldMgr = target.manager;

      newTxs.push({
        txHash,
        blockNumber: currentBlk,
        timestamp: dt.formatted,
        type: 'CHANGE_MANAGER',
        assetId: target.id,
        assetName: target.name,
        operator: activeOperator,
        recipient: targetManager,
        status: 'SUCCESS',
        eventName: 'ManagerAssigned',
        gasUsed: 48500 + Math.floor(Math.random() * 3000),
        details: {
          previousManager: oldMgr,
          newManager: targetManager,
          labRoom: target.labRoom,
          notes
        }
      });

      newEvents.push({
        id: `TL_${Date.now()}_${idx}`,
        timestamp: dt.formatted,
        date: dt.date,
        time: dt.time,
        action: 'Phân công người quản lý',
        operator: activeOperator,
        assetId: target.id,
        assetName: target.name,
        content: `Quản trị viên ${activeOperator} đã phân công thiết bị từ ${oldMgr} sang ${targetManager} phụ trách. (${notes})`,
        txHash,
        blockNumber: currentBlk,
        status: 'Hoàn thành',
        type: 'CHANGE_MANAGER'
      });
    });

    setBlockNumber(currentBlk);
    const idSet = new Set(validTargets.map(t => t.id));
    setAllAssets(prev => prev.map(item => {
      if (idSet.has(item.id)) {
        return {
          ...item,
          manager: targetManager,
          updatedAt: dt.date
        };
      }
      return item;
    }));

    setAllTransactions(prev => [...newTxs, ...prev]);
    setAllTimelineEvents(prev => [...newEvents, ...prev]);
    addToast(`Đã phân công ${validTargets.length} thiết bị cho ${targetManager} thành công.`, 'success');

    return {
      success: true,
      count: validTargets.length,
      message: `Đã phân công ${validTargets.length} thiết bị cho ${targetManager}.`
    };
  };

  const borrowAsset = (
    assetId: string, 
    borrower: string, 
    purpose: string, 
    expectedReturnDate: string, 
    note?: string, 
    operator?: string
  ) => {
    const target = assets.find(a => a.id === assetId);
    if (!target) {
      addToast('Không tìm thấy thiết bị hoặc thiết bị không thuộc phạm vi quản lý.', 'error');
      return { success: false, tx: {} as any };
    }

    const activeOperator = operator || currentUser?.name || borrower;
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'BORROW',
      assetId: target.id,
      assetName: target.name,
      operator: activeOperator,
      recipient: borrower,
      status: 'SUCCESS',
      eventName: 'AssetBorrowed',
      gasUsed: 46200 + Math.floor(Math.random() * 3000),
      details: {
        borrower,
        purpose,
        expectedReturnDate,
        note: note || ''
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Mượn thiết bị',
      operator: activeOperator,
      assetId: target.id,
      assetName: target.name,
      content: `Mượn thiết bị phục vụ: "${purpose}". Người mượn: ${borrower}. Dự kiến trả ngày ${expectedReturnDate}. ${note ? `Ghi chú: ${note}` : ''}`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'BORROW'
    };

    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          status: 'borrowed',
          updatedAt: dt.date,
          borrowInfo: {
            borrower,
            borrowDate: dt.date,
            expectedReturnDate,
            purpose,
            note
          }
        };
      }
      return item;
    }));

    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Mượn thiết bị thành công.', 'success');

    return { success: true, tx: newTx };
  };

  const returnAsset = (
    assetId: string, 
    returner: string, 
    condition: string, 
    notes?: string, 
    operator?: string
  ) => {
    const target = assets.find(a => a.id === assetId);
    if (!target) {
      addToast('Không tìm thấy thiết bị hoặc thiết bị không thuộc phạm vi quản lý.', 'error');
      return { success: false, tx: {} as any };
    }

    const activeOperator = operator || currentUser?.name || returner;
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'RETURN',
      assetId: target.id,
      assetName: target.name,
      operator: activeOperator,
      recipient: target.manager,
      status: 'SUCCESS',
      eventName: 'AssetReturned',
      gasUsed: 43100 + Math.floor(Math.random() * 2500),
      details: {
        returner,
        condition,
        notes: notes || '',
        manager: target.manager
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Trả thiết bị',
      operator: activeOperator,
      assetId: target.id,
      assetName: target.name,
      content: `Đã hoàn trả thiết bị cho quản lý ${target.manager}. Tình trạng: "${condition}". ${notes ? `Ghi chú: ${notes}` : ''}`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'RETURN'
    };

    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          status: 'available',
          updatedAt: dt.date,
          borrowInfo: undefined
        };
      }
      return item;
    }));

    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Trả thiết bị thành công. Thiết bị đã về trạng thái Sẵn sàng.', 'success');

    return { success: true, tx: newTx };
  };

  const createMaintenance = (
    assetId: string, 
    issue: string, 
    description: string, 
    assignee: ManagerName, 
    startDate: string, 
    expectedCompletionDate: string, 
    notes?: string, 
    operator?: string
  ) => {
    const target = assets.find(a => a.id === assetId);
    if (!target) {
      addToast('Không tìm thấy thiết bị hoặc bạn không có quyền với thiết bị này.', 'error');
      return { success: false, tx: {} as any };
    }

    const activeOperator = operator || currentUser?.name || assignee;
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();
    const recordId = 'BT' + (allMaintenanceRecords.length + 1).toString().padStart(3, '0');

    const newRecord: MaintenanceRecord = {
      id: recordId,
      assetId: target.id,
      assetName: target.name,
      requestDate: dt.date,
      issue,
      description,
      assignee,
      status: 'Đang bảo trì',
      startDate: startDate || dt.date,
      expectedCompletionDate,
      txHash,
      notes: notes || ''
    };

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'MAINTENANCE',
      assetId: target.id,
      assetName: target.name,
      operator: activeOperator,
      recipient: assignee,
      status: 'SUCCESS',
      eventName: 'MaintenanceCreated',
      gasUsed: 56700 + Math.floor(Math.random() * 3000),
      details: {
        recordId,
        issue,
        assignee,
        expectedCompletionDate
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Gửi bảo trì',
      operator: activeOperator,
      assetId: target.id,
      assetName: target.name,
      content: `Yêu cầu bảo trì: "${issue}". Người phụ trách kỹ thuật: ${assignee}. Dự kiến hoàn thành: ${expectedCompletionDate}.`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'MAINTENANCE'
    };

    setAllMaintenanceRecords(prev => [newRecord, ...prev]);
    setAllAssets(prev => prev.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          status: 'maintenance',
          updatedAt: dt.date
        };
      }
      return item;
    }));
    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Tạo yêu cầu bảo trì thành công.', 'success');

    return { success: true, tx: newTx };
  };

  const updateMaintenance = (
    maintenanceId: string,
    updatedFields: Partial<MaintenanceRecord>,
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền chỉnh sửa / duyệt hồ sơ bảo trì.', 'error');
      return { success: false, message: 'Không có quyền.' };
    }

    const record = allMaintenanceRecords.find(r => r.id === maintenanceId);
    if (!record) {
      addToast('Không tìm thấy phiếu bảo trì.', 'error');
      return { success: false, message: 'Bản ghi không tồn tại.' };
    }

    setAllMaintenanceRecords(prev => prev.map(item => {
      if (item.id === maintenanceId) {
        return {
          ...item,
          ...updatedFields
        };
      }
      return item;
    }));

    if (updatedFields.status === 'Hoàn thành') {
      setAllAssets(prev => prev.map(a => {
        if (a.id === record.assetId && a.status === 'maintenance') {
          return { ...a, status: 'available' };
        }
        return a;
      }));
    }

    addToast('Cập nhật phiếu bảo trì thành công.', 'success');
    return { success: true, message: 'Cập nhật thành công.' };
  };

  const cancelMaintenance = (
    maintenanceId: string,
    reason: string = 'Hủy yêu cầu bảo trì',
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền hủy / xóa phiếu bảo trì.', 'error');
      return { success: false, message: 'Không có quyền.' };
    }

    const record = allMaintenanceRecords.find(r => r.id === maintenanceId);
    if (!record) {
      addToast('Không tìm thấy bản ghi bảo trì.', 'error');
      return { success: false, message: 'Bản ghi không tồn tại.' };
    }

    setAllMaintenanceRecords(prev => prev.map(item => {
      if (item.id === maintenanceId) {
        return {
          ...item,
          status: 'Đã hủy',
          notes: item.notes ? `${item.notes} | Đã hủy: ${reason}` : `Đã hủy: ${reason}`
        };
      }
      return item;
    }));

    setAllAssets(prev => prev.map(a => {
      if (a.id === record.assetId && a.status === 'maintenance') {
        return { ...a, status: 'available' };
      }
      return a;
    }));

    addToast('Đã hủy phiếu bảo trì.', 'info');
    return { success: true, message: 'Đã hủy phiếu bảo trì.' };
  };

  const completeMaintenance = (
    maintenanceId: string, 
    completedDate: string, 
    notes: string, 
    operator?: string
  ) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có thẩm quyền duyệt nghiệm thu bảo trì.', 'error');
      return { success: false, tx: {} as any };
    }

    const record = allMaintenanceRecords.find(r => r.id === maintenanceId);
    if (!record) return { success: false, tx: {} as any };

    const activeOperator = operator || currentUser?.name || 'Phạm Ngọc Khánh';
    const nextBlock = blockNumber + 1;
    setBlockNumber(nextBlock);
    const txHash = generateTxHash();
    const dt = getFormattedDateTime();

    const newTx: BlockchainTransaction = {
      txHash,
      blockNumber: nextBlock,
      timestamp: dt.formatted,
      type: 'MAINTENANCE',
      assetId: record.assetId,
      assetName: record.assetName,
      operator: activeOperator,
      status: 'SUCCESS',
      eventName: 'MaintenanceCompleted',
      gasUsed: 47200 + Math.floor(Math.random() * 2000),
      details: {
        recordId: maintenanceId,
        completedDate: completedDate || dt.date,
        notes
      }
    };

    const newEvent: TimelineEvent = {
      id: 'TL_' + Date.now(),
      timestamp: dt.formatted,
      date: dt.date,
      time: dt.time,
      action: 'Hoàn thành bảo trì (Đã duyệt nghiệm thu)',
      operator: activeOperator,
      assetId: record.assetId,
      assetName: record.assetName,
      content: `Quản trị viên ${activeOperator} đã duyệt nghiệm thu bảo trì, thiết bị đạt tiêu chuẩn vận hành bình thường. Ghi chú: ${notes || 'Đã kiểm tra và vận hành thử ổn định'}.`,
      txHash,
      blockNumber: nextBlock,
      status: 'Hoàn thành',
      type: 'MAINTENANCE'
    };

    setAllMaintenanceRecords(prev => prev.map(item => {
      if (item.id === maintenanceId) {
        return {
          ...item,
          status: 'Hoàn thành',
          completedDate: completedDate || dt.date,
          notes: notes ? `${item.notes} | Nghiệm thu: ${notes}` : item.notes
        };
      }
      return item;
    }));

    setAllAssets(prev => prev.map(item => {
      if (item.id === record.assetId && item.status === 'maintenance') {
        return {
          ...item,
          status: 'available',
          updatedAt: dt.date
        };
      }
      return item;
    }));

    setAllTransactions(prev => [newTx, ...prev]);
    setAllTimelineEvents(prev => [newEvent, ...prev]);
    addToast('Duyệt nghiệm thu bảo trì thành công.', 'success');

    return { success: true, tx: newTx };
  };

  // User / Manager Account Management (Admin only)
  const createManagerAccount = async (data: {
    username: string;
    password?: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    department: string;
    avatarColor: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền tạo tài khoản người quản lý.', 'error');
      return { success: false, message: 'Không có quyền thực hiện.' };
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanUsername || !cleanName) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và họ tên.' };
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      addToast('Tên đăng nhập này đã tồn tại trong hệ thống.', 'error');
      return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
    }

    if (users.some(u => u.name.toLowerCase() === cleanName.toLowerCase())) {
      addToast('Họ và tên người quản lý này đã tồn tại.', 'error');
      return { success: false, message: 'Tên người quản lý đã tồn tại.' };
    }

    const pwdPlain = data.password?.trim() || '123';
    const pwdHash = await hashPasswordSHA256(pwdPlain);

    const newUser: UserAccount = {
      id: 'USR_MGR_' + Date.now(),
      username: cleanUsername,
      passwordHash: pwdHash,
      name: cleanName,
      role: 'manager', // Strictly manager role (only 3 fixed admins allowed)
      title: data.title.trim() || 'Quản lý Thiết bị Phòng Thí nghiệm',
      email: data.email.trim() || `${cleanUsername}@lab.edu.vn`,
      phone: data.phone.trim() || '0900 000 000',
      department: data.department.trim() || 'Trung tâm Thí nghiệm Практик',
      avatarColor: data.avatarColor || 'from-sky-400 to-indigo-500'
    };

    setUsers(prev => [...prev, newUser]);
    addToast(`Đã tạo tài khoản người quản lý "${cleanName}" thành công.`, 'success');
    return { success: true, message: 'Tạo tài khoản thành công.' };
  };

  const updateManager = async (
    originalName: string,
    updatedData: Partial<ManagerProfile> & { newPassword?: string; username?: string }
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền chỉnh sửa tài khoản.', 'error');
      return { success: false, message: 'Không có quyền.' };
    }

    const targetUser = users.find(u => u.name === originalName);
    if (!targetUser) {
      return { success: false, message: 'Không tìm thấy tài khoản.' };
    }

    // Protect the 3 fixed Admin names from being renamed if they are admins
    const newName = targetUser.role === 'admin' ? targetUser.name : (updatedData.name?.trim() || targetUser.name);

    let newPasswordHash = targetUser.passwordHash;
    if (updatedData.newPassword && updatedData.newPassword.trim()) {
      newPasswordHash = await hashPasswordSHA256(updatedData.newPassword.trim());
    }

    setUsers(prev => prev.map(u => {
      if (u.name === originalName) {
        return {
          ...u,
          name: newName,
          username: updatedData.username?.trim().toLowerCase() || u.username,
          title: updatedData.role || u.title,
          email: updatedData.email ?? u.email,
          phone: updatedData.phone ?? u.phone,
          department: updatedData.department ?? u.department,
          avatarColor: updatedData.avatarColor || u.avatarColor,
          passwordHash: newPasswordHash
        };
      }
      return u;
    }));

    // If manager name changed, update assigned assets as well
    if (newName !== originalName) {
      setAllAssets(prev => prev.map(a => a.manager === originalName ? { ...a, manager: newName } : a));
    }

    addToast('Cập nhật thông tin tài khoản thành công.', 'success');
    return { success: true, message: 'Cập nhật thành công.' };
  };

  const deleteManager = (name: string) => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền xóa tài khoản người quản lý.', 'error');
      return { success: false, message: 'Không có quyền.' };
    }

    if (FIXED_ADMIN_NAMES.includes(name)) {
      const msg = `Tài khoản "${name}" là Quản trị viên cố định của hệ thống, không được phép xóa.`;
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    const assignedCount = allAssets.filter(a => a.manager === name && a.status !== 'stopped').length;
    if (assignedCount > 0) {
      const msg = `Người quản lý này hiện đang phụ trách ${assignedCount} thiết bị. Vui lòng phân công hoặc chuyển thiết bị sang người quản lý khác trước khi xóa.`;
      addToast(msg, 'warning');
      return { success: false, message: msg };
    }

    setUsers(prev => prev.filter(u => u.name !== name));
    addToast(`Đã xóa tài khoản người quản lý ${name}.`, 'success');
    return { success: true, message: 'Đã xóa tài khoản người quản lý thành công.' };
  };

  const getAssetById = (id: string) => {
    // Enforce data-level RBAC: only return from `assets` (which is already filtered by role)
    return assets.find(a => a.id.toLowerCase() === id.trim().toLowerCase());
  };

  const getAssetTransactions = (assetId: string) => {
    return transactions.filter(t => t.assetId.toLowerCase() === assetId.toLowerCase());
  };

  const getAssetTimeline = (assetId: string) => {
    return timelineEvents.filter(e => e.assetId.toLowerCase() === assetId.toLowerCase());
  };

  const resetToDefaults = () => {
    if (!isAdmin) {
      addToast('Chỉ Quản trị viên mới có quyền khôi phục dữ liệu gốc.', 'error');
      return;
    }
    localStorage.removeItem('lab_blockchain_assets_v2');
    localStorage.removeItem('lab_blockchain_txs');
    localStorage.removeItem('lab_blockchain_timeline');
    localStorage.removeItem('lab_blockchain_maintenance');
    localStorage.removeItem('lab_blockchain_users_v2');
    localStorage.removeItem('lab_blockchain_block');
    setAllAssets(INITIAL_EQUIPMENT);
    setAllTransactions(INITIAL_TRANSACTIONS);
    setAllTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setAllMaintenanceRecords(INITIAL_MAINTENANCE);
    setUsers(INITIAL_USERS);
    setBlockNumber(12569);
    addToast('Đã khôi phục dữ liệu mẫu ban đầu.', 'info');
  };

  return (
    <BlockchainContext.Provider value={{
      currentUser,
      isAdmin,
      users,
      login,
      logout,
      assets,
      allAssets: isAdmin ? allAssets : assets,
      transactions,
      timelineEvents,
      maintenanceRecords,
      managers,
      blockNumber,
      network,
      contractAddress,
      toasts,
      addToast,
      removeToast,
      activeTxModal,
      setActiveTxModal,
      createAsset,
      updateAsset,
      deleteAsset,
      handoverAsset,
      assignMultipleAssets,
      borrowAsset,
      returnAsset,
      createMaintenance,
      updateMaintenance,
      cancelMaintenance,
      completeMaintenance,
      createManagerAccount,
      updateManager,
      deleteManager,
      getAssetById,
      getAssetTransactions,
      getAssetTimeline,
      resetToDefaults
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
