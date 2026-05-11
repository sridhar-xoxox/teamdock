"use client";

import { useStore } from "@/lib/store";
import { Sun, Moon, Lock, Shield, User, Bell, Palette, Users, Save, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, toggleTheme, currentUser, members, updateMemberRole, logoutSession } = useStore();
  const [activeTab, setActiveTab] = useState("general");
  
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    // Mock success
    setStatus({ type: 'success', message: 'Password updated successfully' });
    setPasswordData({ current: "", new: "", confirm: "" });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateMemberRole(memberId, newRole);
    setStatus({ type: 'success', message: `Role updated for member` });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and team settings.</p>
        </div>
        <button 
          onClick={() => currentUser && logoutSession(currentUser.id)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>

      <div className="flex gap-10">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "general" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <User className="h-4 w-4" /> Account
          </button>
          <button 
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "appearance" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <Palette className="h-4 w-4" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "security" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <Lock className="h-4 w-4" /> Security
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveTab("admin")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-4 border-t border-slate-200 dark:border-white/10 pt-5",
                activeTab === "admin" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/5"
              )}
            >
              <Shield className="h-4 w-4" /> Admin Access
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
            
            {status && (
              <div className={cn(
                "mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                status.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
              )}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {status.message}
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h3>
                  <div className="flex items-center gap-6">
                    <div 
                      className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl"
                      style={{ backgroundColor: currentUser?.color || "#6366f1" }}
                    >
                      {currentUser?.initials}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                      <p className="text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mt-2 capitalize">
                        {currentUser?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Theme Preference</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Choose how TeamDock looks to you.</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group",
                        theme === 'light' 
                          ? "border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10" 
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                        <Sun className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Light Mode</span>
                    </button>

                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group",
                        theme === 'dark' 
                          ? "border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10" 
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Moon className="h-8 w-8" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Dark Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Reset</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Update your password to keep your account secure.</p>
                  
                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Password</label>
                      <input 
                        type="password" 
                        value={passwordData.current}
                        onChange={e => setPasswordData(p => ({...p, current: e.target.value}))}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.new}
                          onChange={e => setPasswordData(p => ({...p, new: e.target.value}))}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.confirm}
                          onChange={e => setPasswordData(p => ({...p, confirm: e.target.value}))}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                      <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" /> Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "admin" && isAdmin && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Member Role Management</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">As an admin, you can manage team roles and permissions.</p>
                  
                  <div className="overflow-hidden border border-slate-200 dark:border-white/10 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Member</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Current Role</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                        {members.map(member => (
                          <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ backgroundColor: member.color }}
                                >
                                  {member.initials}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                                  <p className="text-[11px] text-slate-500">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                member.role.toLowerCase() === "admin" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                              )}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select 
                                defaultValue={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                className="bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                              >
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Member">Member</option>
                                <option value="Guest">Guest</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
