import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Settings, 
  Trophy, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Activity, 
  RefreshCw,
  Award,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUserRole?: (userId: string, newRole: 'user' | 'admin') => void;
  onResetUserProgress?: (userId: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('chessplus-all-users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.phone && u.phone.includes(searchQuery))
  );

  const handleDeleteUser = (userId: string) => {
    if (confirm('क्या आप सच में इस यूजर का डेटा हटाना चाहते हैं?')) {
      const updated = usersList.filter(u => u.id !== userId);
      setUsersList(updated);
      localStorage.setItem('chessplus-all-users', JSON.stringify(updated));
    }
  };

  const handleToggleAdmin = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, role: (u.role === 'admin' ? 'user' : 'admin') as 'user' | 'admin' };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('chessplus-all-users', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-4xl w-full shadow-2xl text-neutral-100 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Admin Control Panel
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              खिलाड़ियों के अकाउंट्स, लेवल्स, रेटिंग्स और सर्वर एक्टिविटी का पूरा नियंत्रण
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Game Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="खिलाड़ी का नाम, ईमेल या मोबाइल नंबर सर्च करें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Users Table */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Elo / Level</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                          कोई यूजर नहीं मिला
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-neutral-200">{u.name}</div>
                            <div className="text-[10px] text-neutral-500">ID: {u.id.slice(0, 8)}</div>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400">
                            {u.email || u.phone || 'Guest'}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-amber-400">{u.rating} Elo</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                                Lvl {u.completedLevels?.length || 0}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleAdmin(u.id)}
                                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold transition-colors cursor-pointer"
                                title="Admin Rights Toggle"
                              >
                                {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-xs">कुल पंजीकृत खिलाड़ी</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">{usersList.length}</div>
                <p className="text-[10px] text-emerald-400 mt-1">100% एक्टिव डेटाबेस</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-xs">टैक्टिकल लेवल्स पार</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {usersList.reduce((acc, u) => acc + (u.completedLevels?.length || 0), 0)}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">कुल पहेलियाँ हल</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="text-xs">औसत खिलाड़ी रेटिंग</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {usersList.length > 0 
                    ? Math.round(usersList.reduce((acc, u) => acc + u.rating, 0) / usersList.length)
                    : 1200}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Elo Skill Average</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-sm font-bold text-white mb-2">सिस्टम डेटा रीसेट एवं मेंटेनेंस</h3>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  यहाँ से आप सर्वर कैश और लोकल डेटाबेस को साफ़ या सिंक कर सकते हैं।
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (confirm('क्या आप सभी डेमो यूजर्स को रीसेट करना चाहते हैं?')) {
                        localStorage.removeItem('chessplus-all-users');
                        setUsersList([]);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear All Test Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
