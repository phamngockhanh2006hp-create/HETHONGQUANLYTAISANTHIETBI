export type EquipmentStatus = 
  | 'using'        // Đang sử dụng (xanh lá)
  | 'available'    // Sẵn sàng (xanh dương)
  | 'maintenance'  // Đang bảo trì (cam)
  | 'borrowed'     // Đang được mượn (tím)
  | 'stopped';     // Ngừng sử dụng (xám)

export type UserRole = 'admin' | 'manager';

export type ManagerName = string;

export interface UserAccount {
  id: string;
  username: string;        // Tên đăng nhập
  passwordHash: string;    // Mã băm mật khẩu (SHA-256)
  name: string;            // Họ và tên
  role: UserRole;          // 'admin' | 'manager'
  title: string;           // Chức danh
  email: string;
  phone: string;
  department: string;
  avatarColor: string;
}

export interface Equipment {
  id: string;              // Mã tài sản (TS001...)
  name: string;            // Tên thiết bị
  category: string;        // Loại thiết bị
  labRoom: string;         // Phòng thí nghiệm
  status: EquipmentStatus; // Trạng thái
  manager: ManagerName;    // Người phụ trách
  manufacturer: string;    // Hãng sản xuất
  model: string;           // Model
  serialNumber: string;    // Serial Number
  purchaseDate: string;    // Ngày mua
  price: string;           // Giá trị thiết bị
  description: string;     // Mô tả
  updatedAt: string;       // Ngày cập nhật
  createdAt: string;       // Ngày tạo
  borrowInfo?: {
    borrower: string;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
    note?: string;
  };
}

export type TransactionType = 
  | 'CREATE_ASSET'
  | 'UPDATE_ASSET'
  | 'HANDOVER'
  | 'BORROW'
  | 'RETURN'
  | 'MAINTENANCE'
  | 'CHANGE_MANAGER'
  | 'DEACTIVATE_ASSET';

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  type: TransactionType;
  assetId: string;
  assetName: string;
  operator: string;
  recipient?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  eventName: string;
  gasUsed: number;
  details: Record<string, any>;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  action: string;
  operator: string;
  assetId: string;
  assetName: string;
  content: string;
  txHash: string;
  blockNumber: number;
  status: 'Hoàn thành' | 'Đang xử lý';
  type: TransactionType;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  requestDate: string;
  issue: string;
  description: string;
  assignee: ManagerName;
  status: 'Chờ xử lý' | 'Đang bảo trì' | 'Hoàn thành' | 'Đã hủy';
  startDate: string;
  expectedCompletionDate: string;
  completedDate?: string;
  txHash: string;
  notes: string;
}

export interface ManagerProfile {
  id?: string;
  username?: string;
  name: ManagerName;
  role: string;
  userRole?: UserRole;
  email: string;
  phone: string;
  department: string;
  avatarColor: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
