import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Send,
  Wallet,
  Receipt,
  ShieldAlert,
  Bot,
  Watch,
  Bell,
  Settings,
  Users,
  Cpu,
  AlertOctagon,
  LogOut,
  X,
  CreditCard,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  mobileOpen,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onCloseMobile();
  };

  const navLinkClass = (path: string) => {
    const isActive = currentPath === path;
    return `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
    }`;
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Lockup */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Watch className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                WristPay <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase block mt-1">
                IoT Cashless Wallet
              </span>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Overview */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Overview
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNav('/dashboard')}
                className={navLinkClass('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          {/* Payments */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Payments
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNav('/send-money')}
                className={navLinkClass('/send-money')}
              >
                <Send className="w-4 h-4" />
                <span>Send Money</span>
              </button>
              <button
                onClick={() => handleNav('/wallet')}
                className={navLinkClass('/wallet')}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet</span>
              </button>
              <button
                onClick={() => handleNav('/transactions')}
                className={navLinkClass('/transactions')}
              >
                <Receipt className="w-4 h-4" />
                <span>Transactions</span>
              </button>
            </nav>
          </div>

          {/* Intelligence */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Intelligence
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNav('/ai-security')}
                className={navLinkClass('/ai-security')}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>AI Security</span>
              </button>
              <button
                onClick={() => handleNav('/ai-assistant')}
                className={navLinkClass('/ai-assistant')}
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
            </nav>
          </div>

          {/* IoT */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              IoT Hardware
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNav('/iot-simulator')}
                className={navLinkClass('/iot-simulator')}
              >
                <Watch className="w-4 h-4 text-emerald-400" />
                <span className="flex-1 text-left">IoT Simulator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
            </nav>
          </div>

          {/* System */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              System
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNav('/notifications')}
                className={navLinkClass('/notifications')}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => handleNav('/settings')}
                className={navLinkClass('/settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Admin Section (Restricted) */}
          {user?.role === 'ADMIN' && (
            <div className="pt-2 border-t border-slate-800">
              <div className="px-3 mb-2 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>Admin Console</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                  ROOT
                </span>
              </div>
              <nav className="space-y-0.5">
                <button
                  onClick={() => handleNav('/admin')}
                  className={navLinkClass('/admin')}
                >
                  <Layers className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/users')}
                  className={navLinkClass('/admin/users')}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/devices')}
                  className={navLinkClass('/admin/devices')}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Devices</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/transactions')}
                  className={navLinkClass('/admin/transactions')}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Transactions</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/alerts')}
                  className={navLinkClass('/admin/alerts')}
                >
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Alerts</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-semibold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user?.wristwatch_id}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              handleNav('/login');
            }}
            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-800/80 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 bg-slate-950 h-full border-r border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
