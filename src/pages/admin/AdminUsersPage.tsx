import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin';
import { User } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Watch,
  Wallet,
  Shield,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

export const AdminUsersPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminService.getUsers();
      setUsers(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.wristwatch_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin User Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered wallet holders, assigned ESP32 wristwatches, and balance balances.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Total Users: {users.length}
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, watch ID, user ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'USER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try broadening search criteria."
        />
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">User ID</th>
                <th className="pb-3">Name & Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Wallet Balance</th>
                <th className="pb-3 text-center">Wristwatch ID</th>
                <th className="pb-3 text-right pr-2">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2 font-mono text-slate-400">{u.id}</td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                    ₹{u.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-center">
                    <span className="font-mono text-emerald-400 font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
                      {u.wristwatch_id}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right font-mono text-slate-500">
                    {new Date(u.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
