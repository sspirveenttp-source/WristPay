import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoModeBanner } from './components/layout/DemoModeBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { WalletPage } from './pages/user/WalletPage';
import { SendMoneyPage } from './pages/user/SendMoneyPage';
import { TransactionsPage } from './pages/user/TransactionsPage';
import { AiSecurityPage } from './pages/user/AiSecurityPage';
import { IotSimulatorPage } from './pages/user/IotSimulatorPage';
import { AiAssistantPage } from './pages/user/AiAssistantPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { SettingsPage } from './pages/user/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminDevicesPage } from './pages/admin/AdminDevicesPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

// Error Pages
import { NotFoundPage } from './pages/error/NotFoundPage';
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine page type
  const isPublicPage = ['/', '/login', '/register', '/forgot-password'].includes(currentPath);

  // Router switch
  const renderCurrentPage = () => {
    switch (currentPath) {
      // Public
      case '/':
        return <LandingPage navigate={navigate} />;
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage navigate={navigate} />;

      // User
      case '/dashboard':
        return <DashboardPage navigate={navigate} />;
      case '/wallet':
        return <WalletPage navigate={navigate} />;
      case '/send-money':
        return <SendMoneyPage navigate={navigate} />;
      case '/transactions':
        return <TransactionsPage navigate={navigate} />;
      case '/ai-security':
        return <AiSecurityPage navigate={navigate} />;
      case '/iot-simulator':
        return <IotSimulatorPage navigate={navigate} />;
      case '/ai-assistant':
        return <AiAssistantPage navigate={navigate} />;
      case '/notifications':
        return <NotificationsPage navigate={navigate} />;
      case '/settings':
        return <SettingsPage navigate={navigate} />;

      // Admin
      case '/admin':
        return <AdminDashboardPage navigate={navigate} />;
      case '/admin/devices':
        return <AdminDevicesPage navigate={navigate} />;
      case '/admin/transactions':
        return <AdminTransactionsPage navigate={navigate} />;
      case '/admin/alerts':
        return <AdminAlertsPage navigate={navigate} />;
      case '/admin/users':
        return <AdminUsersPage navigate={navigate} />;

      case '/unauthorized':
        return <UnauthorizedPage navigate={navigate} />;

      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  // If public page, render full viewport without app shell sidebar
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <DemoModeBanner />
        <div className="flex-1">{renderCurrentPage()}</div>
      </div>
    );
  }

  // App Shell layout for authenticated app
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Top Demo Mode Banner */}
      <DemoModeBanner />

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          currentPath={currentPath}
          navigate={navigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Right Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Navbar
            currentPath={currentPath}
            navigate={navigate}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentPage()}
          </main>

          <Footer navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
