"use client";
import { useState } from "react";
import { Users, Mail, Phone, MoreHorizontal, Shield, Clock, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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

  const isAdmin = currentUser?.role === "Workspace Admin";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    addInvite(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
          <Users className="h-4 w-4" />
          <span>Workspace</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Team Members</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your workspace collaborators and permissions.</p>
      </header>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const userTasks = tasks.filter((t) => t.assigneeId === m.id);
          const done = userTasks.filter((t) => t.isCompleted).length;

          return (
            <div key={m.id} className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 hover:border-indigo-500/50 transition-all shadow-sm">
              <div className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span 
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg shadow-black/20"
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {m.name}
                    {m.id === currentUser?.id && <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-300">You</span>}
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{m.role}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" /> {m.email}
                </div>
                {m.role === "Workspace Admin" && (
                  <div className="flex items-center gap-3 text-sm text-amber-600 dark:text-amber-400 font-semibold">
                    <Shield className="h-4 w-4" /> Admin Access
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-black/20 p-3">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Task Completion</span>
                  <span className="text-slate-800 dark:text-slate-200">{done} / {userTasks.length}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: userTasks.length ? `${(done / userTasks.length) * 100}%` : "0%",
                      backgroundColor: m.color 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Pending Invites */}
        {invites.map((i) => (
          <div key={i.email} className="group relative rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 p-6 opacity-80">
            {isAdmin && (
              <button 
                onClick={() => removeInvite(i.email)}
                className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                title="Revoke Invite"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-4 mb-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-white/20">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Pending Invite</h3>
                <p className="text-sm text-indigo-500 dark:text-indigo-400/70 font-semibold">{i.role}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" /> {i.email}
              </div>
            </div>
          </div>
        ))}

        {/* Invite Card / Form */}
        {isAdmin && (
          showInviteForm ? (
            <div className="rounded-2xl border border-indigo-500/50 bg-white dark:bg-white/5 p-6 flex flex-col justify-center relative shadow-sm">
              <button 
                onClick={() => setShowInviteForm(false)}
                className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Send Invite</h3>
              <form onSubmit={handleInvite} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition-colors"
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-white dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100">{r}</option>)}
                </select>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
                >
                  Send Invitation
                </button>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setShowInviteForm(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-transparent p-6 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-indigo-500/50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all min-h-[250px] shadow-sm hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-indigo-500/20">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-bold">Invite Member</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
