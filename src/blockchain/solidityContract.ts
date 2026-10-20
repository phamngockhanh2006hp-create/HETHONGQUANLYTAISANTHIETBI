export const SOLIDITY_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LabAssetManager
 * @dev Hợp đồng thông minh quản lý vòng đời tài sản thiết bị phòng thí nghiệm
 * Đồ án môn học: Công nghệ Blockchain
 */
contract LabAssetManager {
    enum EquipmentStatus {
        Using,        // 0: Đang sử dụng
        Available,    // 1: Sẵn sàng
        Maintenance,  // 2: Đang bảo trì
        Borrowed,     // 3: Đang được mượn
        Stopped       // 4: Ngừng sử dụng
    }

    struct Asset {
        string assetId;
        string name;
        string category;
        string labRoom;
        string manufacturer;
        string model;
        string serialNumber;
        string purchaseDate;
        string price;
        string manager;
        EquipmentStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    struct ActionRecord {
        uint256 recordId;
        string actionType;
        string operator;
        string recipient;
        string details;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Mapping từ assetId => Asset
    mapping(string => Asset) private assets;
    // Mapping từ assetId => danh sách lịch sử thao tác
    mapping(string => ActionRecord[]) private assetHistory;

    // Tổng số lượng tài sản và bản ghi
    uint256 public totalAssets;
    uint256 public totalRecords;

    // Địa chỉ của quản trị viên hệ thống
    address public owner;

    // Các sự kiện (Events) được emit trên Blockchain
    event AssetCreated(
        string indexed assetId,
        string name,
        string manager,
        string labRoom,
        uint256 timestamp
    );

    event AssetHandedOver(
        string indexed assetId,
        string previousManager,
        string newManager,
        string labRoom,
        uint256 timestamp
    );

    event AssetBorrowed(
        string indexed assetId,
        string borrower,
        string purpose,
        string expectedReturnDate,
        uint256 timestamp
    );

    event AssetReturned(
        string indexed assetId,
        string returner,
        string condition,
        uint256 timestamp
    );

    event MaintenanceCreated(
        string indexed assetId,
        string issue,
        string assignee,
        uint256 timestamp
    );

    event ManagerChanged(
        string indexed assetId,
        string oldManager,
        string newManager,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Chi quan tri vien moi co quyen");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Khởi tạo tài sản mới trên Blockchain
     */
    function createAsset(
        string memory _assetId,
        string memory _name,
        string memory _category,
        string memory _labRoom,
        string memory _manufacturer,
        string memory _model,
        string memory _serialNumber,
        string memory _purchaseDate,
        string memory _price,
        string memory _manager,
        string memory _operator
    ) external returns (bool) {
        require(!assets[_assetId].exists, "Ma tai san da ton tai");
        require(bytes(_assetId).length > 0, "Ma tai san khong hop le");

        assets[_assetId] = Asset({
            assetId: _assetId,
            name: _name,
            category: _category,
            labRoom: _labRoom,
            manufacturer: _manufacturer,
            model: _model,
            serialNumber: _serialNumber,
            purchaseDate: _purchaseDate,
            price: _price,
            manager: _manager,
            status: EquipmentStatus.Available,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        totalAssets++;
        totalRecords++;

        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "CREATE_ASSET",
            operator: _operator,
            recipient: _manager,
            details: string(abi.encodePacked("Khoi tao tai san: ", _name, " tai ", _labRoom)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit AssetCreated(_assetId, _name, _manager, _labRoom, block.timestamp);
        return true;
    }

    /**
     * @dev Bàn giao thiết bị cho người quản lý mới
     */
    function handoverAsset(
        string memory _assetId,
        string memory _newManager,
        string memory _labRoom,
        string memory _notes,
        string memory _operator
    ) external returns (bool) {
        require(assets[_assetId].exists, "Tai san khong ton tai");
        string memory previousManager = assets[_assetId].manager;

        assets[_assetId].manager = _newManager;
        assets[_assetId].labRoom = _labRoom;
        assets[_assetId].updatedAt = block.timestamp;

        totalRecords++;
        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "HANDOVER",
            operator: _operator,
            recipient: _newManager,
            details: _notes,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit AssetHandedOver(_assetId, previousManager, _newManager, _labRoom, block.timestamp);
        return true;
    }

    /**
     * @dev Ghi nhận mượn thiết bị
     */
    function borrowAsset(
        string memory _assetId,
        string memory _borrower,
        string memory _purpose,
        string memory _expectedReturnDate,
        string memory _operator
    ) external returns (bool) {
        require(assets[_assetId].exists, "Tai san khong ton tai");
        require(assets[_assetId].status != EquipmentStatus.Maintenance, "Thiet bi dang bao tri");
        require(assets[_assetId].status != EquipmentStatus.Borrowed, "Thiet bi dang duoc nguoi khac muon");

        assets[_assetId].status = EquipmentStatus.Borrowed;
        assets[_assetId].updatedAt = block.timestamp;

        totalRecords++;
        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "BORROW",
            operator: _operator,
            recipient: _borrower,
            details: string(abi.encodePacked("Muc dich: ", _purpose, ". Han tra: ", _expectedReturnDate)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit AssetBorrowed(_assetId, _borrower, _purpose, _expectedReturnDate, block.timestamp);
        return true;
    }

    /**
     * @dev Ghi nhận trả thiết bị về trạng thái sẵn sàng
     */
    function returnAsset(
        string memory _assetId,
        string memory _returner,
        string memory _condition,
        string memory _operator
    ) external returns (bool) {
        require(assets[_assetId].exists, "Tai san khong ton tai");

        assets[_assetId].status = EquipmentStatus.Available;
        assets[_assetId].updatedAt = block.timestamp;

        totalRecords++;
        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "RETURN",
            operator: _operator,
            recipient: assets[_assetId].manager,
            details: string(abi.encodePacked("Tinh trang tra: ", _condition)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit AssetReturned(_assetId, _returner, _condition, block.timestamp);
        return true;
    }

    /**
     * @dev Tạo yêu cầu bảo trì thiết bị
     */
    function createMaintenanceRecord(
        string memory _assetId,
        string memory _issue,
        string memory _assignee,
        string memory _operator
    ) external returns (bool) {
        require(assets[_assetId].exists, "Tai san khong ton tai");

        assets[_assetId].status = EquipmentStatus.Maintenance;
        assets[_assetId].updatedAt = block.timestamp;

        totalRecords++;
        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "MAINTENANCE",
            operator: _operator,
            recipient: _assignee,
            details: string(abi.encodePacked("Noi dung bao tri: ", _issue)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit MaintenanceCreated(_assetId, _issue, _assignee, block.timestamp);
        return true;
    }

    /**
     * @dev Thay đổi người quản lý
     */
    function changeManager(
        string memory _assetId,
        string memory _newManager,
        string memory _operator
    ) external returns (bool) {
        require(assets[_assetId].exists, "Tai san khong ton tai");
        string memory oldManager = assets[_assetId].manager;

        assets[_assetId].manager = _newManager;
        assets[_assetId].updatedAt = block.timestamp;

        totalRecords++;
        assetHistory[_assetId].push(ActionRecord({
            recordId: totalRecords,
            actionType: "CHANGE_MANAGER",
            operator: _operator,
            recipient: _newManager,
            details: string(abi.encodePacked("Dieu chuyen tu ", oldManager, " sang ", _newManager)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit ManagerChanged(_assetId, oldManager, _newManager, block.timestamp);
        return true;
    }

    /**
     * @dev Lấy toàn bộ lịch sử thao tác của một tài sản
     */
    function getAssetHistory(string memory _assetId)
        external
        view
        returns (ActionRecord[] memory)
    {
        require(assets[_assetId].exists, "Tai san khong ton tai");
        return assetHistory[_assetId];
    }
}
`;
