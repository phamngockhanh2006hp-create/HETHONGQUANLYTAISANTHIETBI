import { Equipment, ManagerProfile, MaintenanceRecord, BlockchainTransaction, TimelineEvent, UserAccount } from '../types';

// SHA-256 hash of "123": a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
export const DEFAULT_PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

export const INITIAL_USERS: UserAccount[] = [
  // Đúng 3 tài khoản Quản trị viên (Admin)
  {
    id: 'USR_ADMIN_1',
    username: 'phamngockhanh',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Phạm Ngọc Khánh',
    role: 'admin',
    title: 'Quản trị viên Hệ thống & PTN Sinh học',
    email: 'phamngockhanh@lab.edu.vn',
    phone: '0912 345 678',
    department: 'Viện Công nghệ Sinh học',
    avatarColor: 'from-sky-400 to-indigo-500'
  },
  {
    id: 'USR_ADMIN_2',
    username: 'dangvanly',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Đặng Vân Ly',
    role: 'admin',
    title: 'Quản trị viên Hệ thống & PTN Hóa học',
    email: 'dangvanly@lab.edu.vn',
    phone: '0934 567 890',
    department: 'Khoa Hóa học & Kỹ thuật Môi trường',
    avatarColor: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'USR_ADMIN_3',
    username: 'nguyenkhanhngoc',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Nguyễn Khánh Ngọc',
    role: 'admin',
    title: 'Quản trị viên Hệ thống & PTN Hóa lý',
    email: 'nguyenkhanhngoc@lab.edu.vn',
    phone: '0987 654 321',
    department: 'Viện Khoa học & Kỹ thuật Vật liệu',
    avatarColor: 'from-violet-400 to-purple-600'
  },
  // Các tài khoản Người quản lý thiết bị (Manager)
  {
    id: 'USR_MGR_1',
    username: 'tranminhquan',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Trần Minh Quân',
    role: 'manager',
    title: 'Quản lý Thiết bị PTN Sinh học & Vi sinh',
    email: 'tranminhquan@lab.edu.vn',
    phone: '0901 234 567',
    department: 'Viện Công nghệ Sinh học',
    avatarColor: 'from-cyan-400 to-sky-600'
  },
  {
    id: 'USR_MGR_2',
    username: 'lehoangnam',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Lê Hoàng Nam',
    role: 'manager',
    title: 'Quản lý Thiết bị PTN Hóa học & Phân tích',
    email: 'lehoangnam@lab.edu.vn',
    phone: '0902 345 678',
    department: 'Khoa Hóa học & Kỹ thuật Môi trường',
    avatarColor: 'from-teal-400 to-emerald-600'
  },
  {
    id: 'USR_MGR_3',
    username: 'vuthithao',
    passwordHash: DEFAULT_PASSWORD_HASH,
    name: 'Vũ Thị Thảo',
    role: 'manager',
    title: 'Quản lý Thiết bị PTN Hóa lý & Nano',
    email: 'vuthithao@lab.edu.vn',
    phone: '0903 456 789',
    department: 'Viện Khoa học & Kỹ thuật Vật liệu',
    avatarColor: 'from-amber-400 to-orange-500'
  }
];

export const MANAGERS: ManagerProfile[] = INITIAL_USERS.map(u => ({
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

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'TS001',
    name: 'Kính hiển vi quang học',
    category: 'Thiết bị quang học & quan sát',
    labRoom: 'PTN Sinh học',
    status: 'using',
    manager: 'Phạm Ngọc Khánh',
    manufacturer: 'Olympus Japan',
    model: 'CX23 LED',
    serialNumber: 'OLY-2024-98421',
    purchaseDate: '2024-03-15',
    price: '48.500.000 VNĐ',
    description: 'Kính hiển vi quang học 2 mắt, độ phóng đại 40x - 1000x, đèn LED tích hợp ánh sáng đồng đều chuyên dụng sinh học phân tử.',
    updatedAt: '2026-10-01',
    createdAt: '2024-03-15'
  },
  {
    id: 'TS002',
    name: 'Máy ly tâm',
    category: 'Thiết bị tách chiết & lắng mẫu',
    labRoom: 'PTN Hóa học',
    status: 'maintenance',
    manager: 'Đặng Vân Ly',
    manufacturer: 'Eppendorf Germany',
    model: 'Centrifuge 5425 R',
    serialNumber: 'EPP-5425R-7712',
    purchaseDate: '2024-06-20',
    price: '92.000.000 VNĐ',
    description: 'Máy ly tâm lạnh tốc độ cao 21.300 x g, dung tích rotor 24 vị trí, kiểm soát nhiệt độ từ -10°C đến +40°C.',
    updatedAt: '2026-09-28',
    createdAt: '2024-06-20'
  },
  {
    id: 'TS003',
    name: 'Cân phân tích điện tử',
    category: 'Thiết bị cân đo chính xác',
    labRoom: 'PTN Hóa lý',
    status: 'available',
    manager: 'Nguyễn Khánh Ngọc',
    manufacturer: 'Mettler Toledo Switzerland',
    model: 'MS105DU Semi-Micro',
    serialNumber: 'MT-MS105-09823',
    purchaseDate: '2024-08-10',
    price: '65.000.000 VNĐ',
    description: 'Cân bán vi lượng độ phân giải 0.01 mg, hiệu chuẩn tự động FACT, buồng chắn gió kính trượt 3 hướng.',
    updatedAt: '2026-09-30',
    createdAt: '2024-08-10'
  },
  {
    id: 'TS004',
    name: 'Tủ an toàn sinh học',
    category: 'Thiết bị bảo vệ & kiểm soát vi sinh',
    labRoom: 'PTN Vi sinh',
    status: 'using',
    manager: 'Trần Minh Quân',
    manufacturer: 'ESCO Global Singapore',
    model: 'Airstream AC2-4E8 Class II',
    serialNumber: 'ESC-AC2-44109',
    purchaseDate: '2023-11-05',
    price: '135.000.000 VNĐ',
    description: 'Tủ an toàn sinh học cấp II Type A2, màng lọc ULPA hiệu suất 99.999%, cảm biến luồng khí vi xử lý Sentinel Gold.',
    updatedAt: '2026-09-25',
    createdAt: '2023-11-05'
  },
  {
    id: 'TS005',
    name: 'Máy quang phổ UV-Vis',
    category: 'Thiết bị quang phổ & phân tích hóa học',
    labRoom: 'PTN Hóa học',
    status: 'available',
    manager: 'Lê Hoàng Nam',
    manufacturer: 'Shimadzu Japan',
    model: 'UV-1900i Spectrophotometer',
    serialNumber: 'SHIM-UV19-5561',
    purchaseDate: '2024-01-18',
    price: '115.000.000 VNĐ',
    description: 'Máy quang phổ tử ngoại - khả kiến dải đo 190 - 1100 nm, tốc độ quét lên đến 29.000 nm/phút.',
    updatedAt: '2026-10-02',
    createdAt: '2024-01-18'
  },
  {
    id: 'TS006',
    name: 'Máy khuấy từ gia nhiệt',
    category: 'Thiết bị khuấy trộn & nhiệt độ',
    labRoom: 'PTN Hóa lý',
    status: 'borrowed',
    manager: 'Vũ Thị Thảo',
    manufacturer: 'IKA Germany',
    model: 'RCT basic magnetic stirrer',
    serialNumber: 'IKA-RCT-33120',
    purchaseDate: '2024-04-22',
    price: '28.000.000 VNĐ',
    description: 'Bếp khuấy từ gia nhiệt bề mặt đĩa nhôm phủ gốm, nhiệt độ tối đa 310°C, tốc độ khuấy 50 - 1500 rpm.',
    updatedAt: '2026-10-01',
    createdAt: '2024-04-22',
    borrowInfo: {
      borrower: 'Vũ Thị Thảo',
      borrowDate: '2026-09-29',
      expectedReturnDate: '2026-10-05',
      purpose: 'Thí nghiệm tổng hợp hạt nano bạc phân tán dung môi',
      note: 'Sử dụng kèm cảm biến nhiệt PT 1000'
    }
  },
  {
    id: 'TS007',
    name: 'Máy đo pH để bàn tự động',
    category: 'Thiết bị đo điện hóa',
    labRoom: 'PTN Sinh học',
    status: 'available',
    manager: 'Trần Minh Quân',
    manufacturer: 'Hanna Instruments USA',
    model: 'HI5221 Research Grade',
    serialNumber: 'HAN-5221-1209',
    purchaseDate: '2024-09-02',
    price: '34.500.000 VNĐ',
    description: 'Máy đo pH độ chính xác cao ±0.002 pH, hiệu chuẩn tự động 5 điểm, lưu trữ dữ liệu GLP.',
    updatedAt: '2026-09-30',
    createdAt: '2024-09-02'
  },
  {
    id: 'TS008',
    name: 'Nồi hấp tiệt trùng Autoclave',
    category: 'Thiết bị tiệt trùng mẫu',
    labRoom: 'PTN Vi sinh',
    status: 'available',
    manager: 'Phạm Ngọc Khánh',
    manufacturer: 'Hirayama Japan',
    model: 'HV-50 Top Loading',
    serialNumber: 'HIR-HV50-8823',
    purchaseDate: '2023-08-14',
    price: '110.000.000 VNĐ',
    description: 'Nồi hấp tiệt trùng hơi nước áp suất cao 50 lít, chu trình tiệt trùng tự động vi xử lý an toàn.',
    updatedAt: '2026-09-20',
    createdAt: '2023-08-14'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'BT001',
    assetId: 'TS002',
    assetName: 'Máy ly tâm',
    requestDate: '2026-09-28',
    issue: 'Rung lắc bất thường khi tốc độ vượt 12.000 rpm và nhiệt độ làm mát không ổn định',
    description: 'Cần căn chỉnh lại trục cân bằng động của rotor và kiểm tra hệ thống làm mát gas r134a.',
    assignee: 'Đặng Vân Ly',
    status: 'Đang bảo trì',
    startDate: '2026-09-29',
    expectedCompletionDate: '2026-10-06',
    txHash: '0x8f3a129d4e2c81729b4e99a38f71092cc88741e920d39e8a719c82a170129bc4',
    notes: 'Kỹ sư hãng Eppendorf đã tiếp nhận thiết bị tại phòng lab.'
  },
  {
    id: 'BT002',
    assetId: 'TS004',
    assetName: 'Tủ an toàn sinh học',
    requestDate: '2026-08-15',
    issue: 'Bảo trì định kỳ màng lọc khí ULPA và hiệu chuẩn cảm biến vi sai lưu lượng',
    description: 'Thay thế màng lọc tiền cấp, khử trùng buồng làm việc bằng formaldehyde hơi và dán tem kiểm định.',
    assignee: 'Phạm Ngọc Khánh',
    status: 'Hoàn thành',
    startDate: '2026-08-16',
    expectedCompletionDate: '2026-08-18',
    completedDate: '2026-08-18',
    txHash: '0x3c714b8a2e1d09f7a932bb81283c79a1f29038d17203e82a938b712390ef198a',
    notes: 'Đã đạt chứng nhận tiêu chuẩn an toàn sinh học Class II Type A2 số KD-2026-881.'
  }
];

export const INITIAL_TRANSACTIONS: BlockchainTransaction[] = [
  {
    txHash: '0x82d49e1a3c72b84910e543bc883901a87612f09d318e9a47102bca8192a39a31',
    blockNumber: 12568,
    timestamp: '02/10/2026 14:15:20',
    type: 'RETURN',
    assetId: 'TS005',
    assetName: 'Máy quang phổ UV-Vis',
    operator: 'Đặng Vân Ly',
    status: 'SUCCESS',
    eventName: 'AssetReturned',
    gasUsed: 42190,
    details: {
      returner: 'Đặng Vân Ly',
      condition: 'Hoạt động tốt, hệ thấu kính quang học sạch',
      labRoom: 'PTN Hóa học'
    }
  },
  {
    txHash: '0x9a44b1c78103e921d7465389a012cf908273615ea8910482b61548a73910c2e1',
    blockNumber: 12567,
    timestamp: '01/10/2026 10:20:11',
    type: 'BORROW',
    assetId: 'TS006',
    assetName: 'Máy khuấy từ gia nhiệt',
    operator: 'Nguyễn Khánh Ngọc',
    recipient: 'Nguyễn Khánh Ngọc',
    status: 'SUCCESS',
    eventName: 'AssetBorrowed',
    gasUsed: 48920,
    details: {
      borrower: 'Nguyễn Khánh Ngọc',
      purpose: 'Thí nghiệm tổng hợp hạt nano bạc',
      expectedReturnDate: '2026-10-05'
    }
  },
  {
    txHash: '0x8f3a129d4e2c81729b4e99a38f71092cc88741e920d39e8a719c82a170129bc4',
    blockNumber: 12566,
    timestamp: '29/09/2026 08:45:00',
    type: 'MAINTENANCE',
    assetId: 'TS002',
    assetName: 'Máy ly tâm',
    operator: 'Đặng Vân Ly',
    status: 'SUCCESS',
    eventName: 'MaintenanceCreated',
    gasUsed: 54100,
    details: {
      assignee: 'Đặng Vân Ly',
      issue: 'Rung lắc rotor > 12.000 rpm',
      expectedCompletion: '2026-10-06'
    }
  },
  {
    txHash: '0x71b2a945d8201c89304e287fa830219c8821903e198a28394e1092384a839210',
    blockNumber: 12565,
    timestamp: '20/09/2026 15:30:42',
    type: 'HANDOVER',
    assetId: 'TS001',
    assetName: 'Kính hiển vi quang học',
    operator: 'Phạm Ngọc Khánh',
    recipient: 'Phạm Ngọc Khánh',
    status: 'SUCCESS',
    eventName: 'AssetHandedOver',
    gasUsed: 51200,
    details: {
      previousManager: 'Nguyễn Khánh Ngọc',
      newManager: 'Phạm Ngọc Khánh',
      labRoom: 'PTN Sinh học',
      notes: 'Bàn giao thiết bị phục vụ kỳ nghiên cứu sinh học tế bào mới'
    }
  },
  {
    txHash: '0x12a9e84710c28394b9102847a9821049382109483a9102834e9102834a910283',
    blockNumber: 12564,
    timestamp: '02/09/2026 09:10:00',
    type: 'CREATE_ASSET',
    assetId: 'TS007',
    assetName: 'Máy đo pH để bàn tự động',
    operator: 'Phạm Ngọc Khánh',
    status: 'SUCCESS',
    eventName: 'AssetCreated',
    gasUsed: 89400,
    details: {
      initialManager: 'Phạm Ngọc Khánh',
      labRoom: 'PTN Sinh học',
      value: '34.500.000 VNĐ'
    }
  },
  {
    txHash: '0x3c714b8a2e1d09f7a932bb81283c79a1f29038d17203e82a938b712390ef198a',
    blockNumber: 12563,
    timestamp: '18/08/2026 16:00:15',
    type: 'MAINTENANCE',
    assetId: 'TS004',
    assetName: 'Tủ an toàn sinh học',
    operator: 'Phạm Ngọc Khánh',
    status: 'SUCCESS',
    eventName: 'MaintenanceCreated',
    gasUsed: 49800,
    details: {
      action: 'Hoàn thành bảo trì màng lọc ULPA',
      status: 'Đã hoàn thành kiểm định'
    }
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'TL001',
    timestamp: '02/10/2026 14:15',
    date: '02/10/2026',
    time: '14:15',
    action: 'Trả thiết bị',
    operator: 'Đặng Vân Ly',
    assetId: 'TS005',
    assetName: 'Máy quang phổ UV-Vis',
    content: 'Đã hoàn tất đo mẫu hấp thụ UV của phức chất hữu cơ. Bàn giao lại thiết bị ở tình trạng sẵn sàng.',
    txHash: '0x82d49e1a3c72b84910e543bc883901a87612f09d318e9a47102bca8192a39a31',
    blockNumber: 12568,
    status: 'Hoàn thành',
    type: 'RETURN'
  },
  {
    id: 'TL002',
    timestamp: '01/10/2026 10:20',
    date: '01/10/2026',
    time: '10:20',
    action: 'Mượn thiết bị',
    operator: 'Nguyễn Khánh Ngọc',
    assetId: 'TS006',
    assetName: 'Máy khuấy từ gia nhiệt',
    content: 'Mượn thiết bị phục vụ thí nghiệm tổng hợp hạt nano bạc. Dự kiến hoàn trả ngày 05/10/2026.',
    txHash: '0x9a44b1c78103e921d7465389a012cf908273615ea8910482b61548a73910c2e1',
    blockNumber: 12567,
    status: 'Hoàn thành',
    type: 'BORROW'
  },
  {
    id: 'TL003',
    timestamp: '29/09/2026 08:45',
    date: '29/09/2026',
    time: '08:45',
    action: 'Gửi bảo trì',
    operator: 'Đặng Vân Ly',
    assetId: 'TS002',
    assetName: 'Máy ly tâm',
    content: 'Yêu cầu bảo trì và cân chỉnh trục ly tâm tốc độ cao rotor 24 vị trí do xuất hiện độ rung quá mức cho phép.',
    txHash: '0x8f3a129d4e2c81729b4e99a38f71092cc88741e920d39e8a719c82a170129bc4',
    blockNumber: 12566,
    status: 'Hoàn thành',
    type: 'MAINTENANCE'
  },
  {
    id: 'TL004',
    timestamp: '20/09/2026 15:30',
    date: '20/09/2026',
    time: '15:30',
    action: 'Bàn giao thiết bị',
    operator: 'Phạm Ngọc Khánh',
    assetId: 'TS001',
    assetName: 'Kính hiển vi quang học',
    content: 'Bàn giao tài sản thiết bị từ Nguyễn Khánh Ngọc sang Phạm Ngọc Khánh phụ trách trực tiếp tại PTN Sinh học.',
    txHash: '0x71b2a945d8201c89304e287fa830219c8821903e198a28394e1092384a839210',
    blockNumber: 12565,
    status: 'Hoàn thành',
    type: 'HANDOVER'
  },
  {
    id: 'TL005',
    timestamp: '02/09/2026 09:10',
    date: '02/09/2026',
    time: '09:10',
    action: 'Tạo asset',
    operator: 'Phạm Ngọc Khánh',
    assetId: 'TS007',
    assetName: 'Máy đo pH để bàn tự động',
    content: 'Khởi tạo tài sản mới trên blockchain LabChain, gán định danh duy nhất TS007 và tạo mã định danh QR.',
    txHash: '0x12a9e84710c28394b9102847a9821049382109483a9102834e9102834a910283',
    blockNumber: 12564,
    status: 'Hoàn thành',
    type: 'CREATE_ASSET'
  }
];
