"use client";

import { useStore } from "@/lib/store";
import { Sun, Moon, Lock, Shield, User, Bell, Palette, Save, CheckCircle2 } from "lucide-react";
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


  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Manage your account preferences and team settings.</p>
        </div>
        <button 
          onClick={() => currentUser && logoutSession(currentUser.id)}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0 border border-transparent hover:border-red-500/20"
        >
          Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
          <button 
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "general" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <User className="h-4 w-4" /> <span className="shrink-0">Account</span>
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
            <Palette className="h-4 w-4" /> <span className="shrink-0">Appearance</span>
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
            <Lock className="h-4 w-4" /> <span className="shrink-0">Security</span>
          </button>
          
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-8 shadow-sm">
            
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
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div 
                      className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl shrink-0"
                      style={{ backgroundColor: currentUser?.color || "#6366f1" }}
                    >
                      {currentUser?.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl border-2 transition-all group",
                        theme === 'light' 
                          ? "border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10" 
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                        <Sun className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Light Mode</span>
                    </button>
 
                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl border-2 transition-all group",
                        theme === 'dark' 
                          ? "border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10" 
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Moon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Dark Mode</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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


          </div>
        </div>
      </div>
    </div>
  );
}
