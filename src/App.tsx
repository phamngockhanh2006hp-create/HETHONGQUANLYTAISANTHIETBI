
import { useState, useEffect } from 'react';
import { BlockchainProvider, useBlockchain } from './blockchain/blockchainContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { SolidityContractModal } from './components/SolidityContractModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAssetPage } from './pages/CreateAssetPage';
import { EquipmentListPage } from './pages/EquipmentListPage';
import { HandoverPage } from './pages/HandoverPage';
import { BorrowReturnPage } from './pages/BorrowReturnPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ManagersPage } from './pages/ManagersPage';
import { QRCodePage } from './pages/QRCodePage';
import { EquipmentDetailPage } from './pages/EquipmentDetailPage';
import { UsageHistoryPage } from './pages/UsageHistoryPage';
import { LookupPage } from './pages/LookupPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

import { Menu, X, Microscope, FlaskRound as Flask, Atom } from 'lucide-react';

const ADMIN_ONLY_PAGES = ['create-asset', 'managers', 'settings'];

const AppContent: React.FC = () => {
  const { currentUser, isAdmin, assets, addToast } = useBlockchain();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Reset to home page when user logs in or logs out
  useEffect(() => {
    setCurrentPage('home');
    setNavParams(null);
  }, [currentUser?.id]);

  // Support URL hash navigation while strictly enforcing RBAC so URL manipulation cannot bypass permissions
  useEffect(() => {
    const handleHashChange = () => {
      if (!currentUser) return;
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) return;

      const [pagePart, paramPart] = hash.split('/');
      if (ADMIN_ONLY_PAGES.includes(pagePart) && !isAdmin) {
        addToast('Bạn không có quyền truy cập đường dẫn dành cho Quản trị viên.', 'error');
        setCurrentPage('home');
        window.history.replaceState(null, '', '#home');
        return;
      }

      if (pagePart === 'equipment-detail' && paramPart) {
        setCurrentPage('equipment-detail');
        setNavParams({ id: paramPart });
      } else if (pagePart) {
        setCurrentPage(pagePart);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, isAdmin]);

  // Mandatory Login Gate: When opening website or after logout, always show LoginPage first
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const navigateTo = (page: string, params?: any) => {
    if (ADMIN_ONLY_PAGES.includes(page) && !isAdmin) {
      addToast('Chức năng này chỉ dành cho Quản trị viên hệ thống.', 'error');
      return;
    }

    setCurrentPage(page);
    setNavParams(params || null);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    navigateTo('lookup');
  };

  const handleQRScannedAsset = (assetId: string) => {
    navigateTo('equipment-detail', { id: assetId });
  };

  return (
    <div className="min-h-screen bg-lab-pattern flex flex-col selection:bg-sky-200 selection:text-sky-900 relative">
      {/* Background Decorative Faint Lab Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl"></div>
        <Atom className="absolute top-24 right-1/4 w-64 h-64 text-sky-200/30 stroke-1 transform rotate-12" />
        <Microscope className="absolute bottom-20 left-72 w-56 h-56 text-teal-200/25 stroke-1" />
        <Flask className="absolute top-2/3 right-16 w-48 h-48 text-indigo-200/20 stroke-1" />
      </div>

      <div className="relative z-10 flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentPage={currentPage}
            onNavigate={navigateTo}
            onOpenContract={() => setIsContractModalOpen(true)}
          />
        </div>

        {/* Mobile Sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/50 backdrop-blur-xs">
            <div className="relative flex-1 max-w-xs w-full bg-white">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                currentPage={currentPage}
                onNavigate={navigateTo}
                onOpenContract={() => {
                  setIsContractModalOpen(true);
                  setMobileSidebarOpen(false);
                }}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <div className="flex items-center">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-3 text-slate-600 hover:bg-slate-100 border-r border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <Header
                onSearchSubmit={handleSearchSubmit}
                onNavigate={navigateTo}
                onOpenContract={() => setIsContractModalOpen(true)}
              />
            </div>
          </div>

          {/* Main Viewport Container */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {currentPage === 'home' && (
              <HomePage
                onNavigate={navigateTo}
                onOpenQRScanner={() => setIsQRScannerOpen(true)}
              />
            )}

            {currentPage === 'create-asset' && (
              <CreateAssetPage
                onNavigate={navigateTo}
              />
            )}

            {currentPage === 'equipment-list' && (
              <EquipmentListPage
                onNavigate={navigateTo}
                initialManagerFilter={navParams?.manager}
              />
            )}

            {currentPage === 'handover' && (
              <HandoverPage
                onNavigate={navigateTo}
                initialAssetId={navParams?.assetId}
              />
            )}

            {currentPage === 'borrow-return' && (
              <BorrowReturnPage
                onNavigate={navigateTo}
                initialTab={navParams?.tab}
                initialAssetId={navParams?.assetId}
              />
            )}

            {currentPage === 'maintenance' && (
              <MaintenancePage
                onNavigate={navigateTo}
                initialAssetId={navParams?.assetId}
              />
            )}

            {currentPage === 'managers' && (
              <ManagersPage
                onNavigate={navigateTo}
              />
            )}

            {currentPage === 'qr-code' && (
              <QRCodePage
                onNavigate={navigateTo}
                onOpenQRScanner={() => setIsQRScannerOpen(true)}
                initialAssetId={navParams?.assetId}
              />
            )}

            {currentPage === 'equipment-detail' && (
              <EquipmentDetailPage
                assetId={navParams?.id || assets[0]?.id || 'TS001'}
                onNavigate={navigateTo}
              />
            )}

            {currentPage === 'usage-history' && (
              <UsageHistoryPage
                onNavigate={navigateTo}
              />
            )}

            {currentPage === 'lookup' && (
              <LookupPage
                initialSearch={searchQuery}
                onNavigate={navigateTo}
              />
            )}

            {currentPage === 'transaction-history' && (
              <TransactionHistoryPage
                onNavigate={navigateTo}
                onOpenContract={() => setIsContractModalOpen(true)}
              />
            )}

            {currentPage === 'settings' && isAdmin && (
              <SettingsPage
                onOpenContract={() => setIsContractModalOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <ToastContainer />
      <TransactionReceiptModal />
      <SolidityContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
      />
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectAsset={handleQRScannedAsset}
      />
    </div>
  );
};

export default function App() {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}
