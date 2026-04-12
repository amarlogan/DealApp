"use client";

import { useState, useEffect } from "react";
import { Users, Shield, User as UserIcon, Mail, Calendar, ArrowUpCircle, ArrowDownCircle, Search, Clock, BadgeCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UsersManagerClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("[UsersAdmin] Manager Mounted. User Count:", users.length);
  }, []);

  const filteredUsers = users.filter(u => {
    const searchStr = search.toLowerCase();
    const displayName = (u.display_name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const id = (u.id || "").toLowerCase();
    
    return displayName.includes(searchStr) || 
           email.includes(searchStr) || 
           id.includes(searchStr);
  });

  const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'user') => {
    // Removed confirm() as it can block agents and some browsers in specific states.
    // Instead, we use instant loading states and clear feedback.
    
    setIsLoading(targetUserId);
    setFeedback(null);
    
    console.log(`[UsersAdmin] Initiating Role Change: ${targetUserId} -> ${newRole}`);
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      const result = await response.json();
      
      if (!response.ok) {
          console.error("[UsersAdmin] API returned error:", result);
          throw new Error(result.error || "Failed to update user role");
      }

      console.log("[UsersAdmin] Role updated successfully:", result);

      // 1. Local UI Update (Instant feedback)
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
      
      // 2. Success Feedback
      setFeedback({ type: 'success', msg: `User ${newRole === 'admin' ? 'promoted' : 'demoted'} successfully!` });
      setTimeout(() => setFeedback(null), 4000);

      // 3. Sync with Server State
      router.refresh();
      
    } catch (err: any) {
      console.error("[UsersAdmin] Role change exception:", err);
      setFeedback({ type: 'error', msg: err.message });
      // Keep error message longer
      setTimeout(() => setFeedback(null), 10000);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">Monitor platform registrations and manage administrative privileges.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-2">
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-black text-gray-900 uppercase">
             Total: {users.length}
           </div>
           <div className="px-4 py-2 text-xs font-black text-gray-400 uppercase">
             Admins: {users.filter(u => u.role === 'admin').length}
           </div>
        </div>
      </div>

      {/* Global Inline Feedback */}
      {feedback && (
        <div className={`p-4 rounded-3xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-4 border ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.msg}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or UUID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Access Role</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 uppercase font-black tracking-widest text-[10px]">No users match current filters.</td>
                </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0f7fb] text-[#53A318] flex items-center justify-center font-black border border-[#53A318]/20 relative">
                      {u.display_name?.[0]?.toUpperCase() || <UserIcon size={16} />}
                      {u.role === 'admin' && (
                         <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-emerald-100">
                           <BadgeCheck size={12} className="text-emerald-500" />
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black text-gray-900 leading-none">{u.display_name || 'Anonymous User'}</span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Mail size={11} />
                        <span className="text-xs font-medium">{u.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase ring-1 ring-emerald-100 shadow-sm">
                        <Shield size={10} /> Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase ring-1 ring-gray-100">
                         Standard User
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <Calendar size={12} className="text-gray-400" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                    {u.last_sign_in && (
                       <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-1">
                          <Clock size={10} />
                          <span>Last online: {new Date(u.last_sign_in).toLocaleDateString()}</span>
                       </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    {u.role !== 'admin' ? (
                      <button 
                        type="button"
                        disabled={!!isLoading}
                        onClick={() => handleRoleChange(u.id, 'admin')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                            isLoading === u.id 
                            ? "bg-gray-100 text-gray-400" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <ArrowUpCircle size={14} /> 
                        {isLoading === u.id ? "Syncing..." : "Promote"}
                      </button>
                    ) : (
                      <button 
                         type="button"
                         disabled={!!isLoading}
                        onClick={() => handleRoleChange(u.id, 'user')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                            isLoading === u.id 
                            ? "bg-gray-100 text-gray-400" 
                            : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
                        }`}
                      >
                        <ArrowDownCircle size={14} /> 
                        {isLoading === u.id ? "Syncing..." : "Demote"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
