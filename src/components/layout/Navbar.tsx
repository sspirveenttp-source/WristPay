import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notifications';
import { AppNotification } from '../../types';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Shield,
  Smartphone,
  ChevronDown,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  currentPath,
  navigate
}) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService.getNotifications(user.id).then((list) => {
        setNotifications(list);
      }).catch(() => {});
    }
  }, [user, currentPath]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const getBreadcrumbTitle = () => {
    switch (currentPath) {
      case '/dashboard': return 'Dashboard';
      case '/wallet': return 'Wallet & Recharge';
      case '/send-money': return 'Send Money';
      case '/transactions': return 'Transaction History';
      case '/ai-security': return 'AI Transaction Intelligence';
      case '/iot-simulator': return 'IoT Wristwatch Simulator';
      case '/ai-assistant': return 'WristPay AI Assistant';
      case '/notifications': return 'Notification Center';
      case '/settings': return 'System Settings';
      case '/admin': return 'Admin Dashboard';
      case '/admin/users': return 'Admin User Management';
      case '/admin/devices': return 'IoT Device Fleet';
      case '/admin/transactions': return 'All Network Transactions';
      case '/admin/alerts': return 'Security & System Alerts';
      default: return 'WristPay AI';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">{getBreadcrumbTitle()}</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-xs text-slate-400 hidden sm:inline font-mono">
              Watch: {user?.wristwatch_id || 'WP-001'}
            </span>
          </div>
        </div>

        {/* Center: Search / Quick Action */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TXN ID, terminal, receiver..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/transactions?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                }
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Right: Actions, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Pay CTA */}
          <button
            onClick={() => navigate('/send-money')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">Notifications ({unreadCount} new)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          navigate('/notifications');
                        }}
                        className={`p-3 hover:bg-slate-800/60 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-950/20' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-200 leading-tight">{n.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 px-3 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      navigate('/notifications');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 text-slate-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{user?.name || 'User'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-100">{user?.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Role: {user?.role}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/wallet');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Wallet Balance
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/iot-simulator');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    IoT Wristwatch
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Settings
                  </button>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-3 py-1.5 text-indigo-400 hover:bg-slate-800 font-medium transition-colors"
                    >
                      Admin Dashboard
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
