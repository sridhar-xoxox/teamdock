"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Users, MoreHorizontal, Shield, Clock, Plus, X, Search, Info, LayoutGrid } from "lucide-react";

const ROLES = [
  "Admin",
  "Manager",
  "Member"
];

export default function TeamPage() {
  const { members, tasks, invites, addInvite, removeInvite, currentUser, updateMemberRole } = useStore();
  const [activeTab, setActiveTab] = useState<"all" | "admins" | "pending">("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLES[0]);
  const [search, setSearch] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase().includes("admin");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    addInvite(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "admins") return matchesSearch && m.role.toLowerCase() === "admin";
    if (activeTab === "pending") return false;
    return matchesSearch;
  });

  const displayInvites = activeTab === "pending" || activeTab === "all" ? invites.filter(i => i.email.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#0d1117] transition-colors duration-300">
      {/* Gmail Style Toolbar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex-1 max-w-2xl relative group ml-2 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search squad members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-0 focus:bg-white dark:focus:bg-white/10 shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setShowInfo(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-white/5 transition-all"
            title="Squad Roles Info"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Recruit
          </button>
        )}
      </div>

      {/* Gmail Style Category Tabs */}
      <div className="flex px-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d1117]">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex items-center gap-3 px-6 py-4 text-sm font-bold border-b-4 transition-all",
            activeTab === "all" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <Users className="h-4 w-4" />
          Primary Members
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={cn(
            "flex items-center gap-3 px-6 py-4 text-sm font-bold border-b-4 transition-all",
            activeTab === "admins" ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <Shield className="h-4 w-4" />
          Admins
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex items-center gap-3 px-6 py-4 text-sm font-bold border-b-4 transition-all",
            activeTab === "pending" ? "border-slate-400 text-slate-700 dark:text-slate-300" : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <Clock className="h-4 w-4" />
          Pending
          {invites.length > 0 && (
            <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{invites.length}</span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showInviteForm && (
          <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
            <div className="max-w-xl mx-auto bg-white dark:bg-[#161b22] p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 relative">
              <button
                onClick={() => setShowInviteForm(false)}
                className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Invite Member</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r} className="bg-white dark:bg-[#0a0f1e]">{r}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                >
                  Send Invitation
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-2 p-4">
          {filteredMembers.map((member) => {
            const memberTasks = tasks.filter(t => t.assigneeId === member.id && !t.isCompleted);
            const loadLevel = memberTasks.length > 5 ? "high" : memberTasks.length > 2 ? "medium" : "low";
            
            return (
              <div key={member.id} className={cn(
                "group relative flex items-center gap-6 px-8 py-5 rounded-[1.25rem] transition-all duration-300 border cursor-pointer",
                "bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-0.5"
              )}>

                {/* Member Identity */}
                <div className="flex items-center gap-4 w-64 shrink-0">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-xl group-hover:scale-110 transition-transform duration-500 relative overflow-hidden"
                    style={{ backgroundColor: member.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter truncate">{member.email}</p>
                  </div>
                </div>

                {/* Role & Load Indicator */}
                <div className="flex-1 flex items-center gap-8 min-w-0">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                      member.role.toLowerCase() === "admin" 
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    )}>
                      {member.role}
                    </span>
                  </div>
                  
                  {/* Activity Spark (Unique feature) */}
                  <div className="hidden md:flex items-center gap-4 flex-1">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          loadLevel === "high" ? "bg-red-500" : loadLevel === "medium" ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min((memberTasks.length / 8) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{memberTasks.length} Tasks</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300" onClick={e => e.stopPropagation()}>
                  {isAdmin ? (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                      <select
                        defaultValue={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        className="bg-transparent border-none px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role} className="bg-white dark:bg-[#0a0f1e]">{role}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5">
                      <Shield className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>


              </div>
            );
          })}

          {displayInvites.map((invite) => (
            <div key={invite.email} className="group relative flex items-center gap-6 px-8 py-5 rounded-[1.25rem] border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100 transition-all duration-300">
              <div className="w-64 shrink-0">
                <span className="text-sm font-black text-slate-400 italic">Personnel Incoming...</span>
              </div>
              <div className="flex-1 flex items-center gap-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 dark:bg-white/5">
                  {invite.role}
                </span>
                <span className="text-xs text-slate-400 font-medium italic truncate">
                  Awaiting confirmation from {invite.email}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {isAdmin && (
                  <button
                    onClick={() => removeInvite(invite.email)}
                    className="bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Abort Recruitment
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && displayInvites.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
              <Users className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-lg font-bold text-slate-900 dark:text-white">No members found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      {/* Role Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowInfo(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d1117] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Squad Role Permissions</h2>
                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500">Understand the operational capabilities of each rank.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Admin</h3>
                  <p className="text-xs leading-relaxed text-slate-500">Full clearance. Can manage team roles, projects, and all tasks. Only Admins have the authority to delete data across the workspace.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Manager</h3>
                  <p className="text-xs leading-relaxed text-slate-500">Structural access. Can see all projects and tasks. Authorized to create new tasks and projects. Cannot delete any data.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Member</h3>
                  <p className="text-xs leading-relaxed text-slate-500">Execution access. Focused entirely on personal objectives. Can only see and interact with tasks assigned directly to them.</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 dark:bg-white/[0.02] flex justify-end">
              <button 
                onClick={() => setShowInfo(false)}
                className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold shadow-lg transition-all active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
