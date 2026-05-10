"use client";
import React, { useState } from "react";
import { Users, Mail, Phone, MoreHorizontal, Shield, Clock, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { MemberCard } from "@/components/MemberCard";
import { InviteCard } from "@/components/InviteCard";

const ROLES = [
  "Frontend Lead",
  "Backend Lead",
  "UI/UX Designer",
  "DevOps Engineer",
  "Product Manager",
  "Full Stack Developer"
];

export default function TeamPage() {
  const { members, tasks, invites, addInvite, removeInvite, currentUser } = useStore();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLES[0]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const isAdmin = currentUser?.role === "Workspace Admin";

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
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(members.map(m => m.role)));

  return (
    <div className="flex h-full flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
      {/* Premium Header */}
      <header className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
            <span className="h-1 w-8 rounded-full bg-indigo-500" />
            Human Resources
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
            Workspace <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Squad</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md">
            The high-performance team behind the pixels. Manage members, roles, and pending invitations.
          </p>
        </div>
        
        {isAdmin && !showInviteForm && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-500/40 transition-all hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-indigo-500/60 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus className="h-5 w-5" />
            Recruit Member
          </button>
        )}
      </header>

      {/* Stats Bar */}
      <div className="mb-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Nodes", value: members.length, color: "text-indigo-500" },
          { label: "Pending Signals", value: invites.length, color: "text-amber-500" },
          { label: "Avg. Velocity", value: "88%", color: "text-emerald-500" },
          { label: "Roles Defined", value: uniqueRoles.length, color: "text-cyan-500" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-5 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Identify member by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] py-4 pl-12 pr-6 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-lg shadow-slate-200/20 dark:shadow-none"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <button className="p-2 rounded-lg bg-white dark:bg-white/10 shadow-sm text-indigo-500"><LayoutGrid className="h-4 w-4" /></button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {/* Invite Form Card */}
        {showInviteForm && (
          <div className="group relative overflow-hidden rounded-[2rem] border-2 border-indigo-500/50 bg-white dark:bg-indigo-500/5 p-8 shadow-2xl shadow-indigo-500/20 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowInviteForm(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Recruit Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Protocol</label>
                <input
                  type="email"
                  required
                  placeholder="comm-link@team.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-5 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Designation</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition-all"
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-white dark:bg-[#0a0f1e]">{r}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 active:scale-95 mt-4"
              >
                Transmit Invitation
              </button>
            </form>
          </div>
        )}

        {filteredMembers.map((m) => (
          <MemberCard 
            key={m.id} 
            member={m} 
            tasks={tasks} 
            isCurrentUser={m.id === currentUser?.id} 
          />
        ))}

        {invites.map((i) => (
          <InviteCard 
            key={i.email} 
            invite={i} 
            isAdmin={isAdmin} 
            onRemove={removeInvite} 
          />
        ))}
        
        {filteredMembers.length === 0 && invites.length === 0 && !showInviteForm && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-50">
            <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Squad Members Found</p>
            <p className="text-sm font-bold text-slate-500">Adjust your search or filters to locate personnel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
