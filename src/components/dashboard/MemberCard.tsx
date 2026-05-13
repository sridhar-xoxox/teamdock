"use client";
import { Mail, Shield, MoreHorizontal } from "lucide-react";
import { Member, Task } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
  tasks: Task[];
  isCurrentUser: boolean;
}

export function MemberCard({ member, tasks, isCurrentUser }: MemberCardProps) {
  const userTasks = tasks.filter((t) => t.assigneeId === member.id);
  const done = userTasks.filter((t) => t.isCompleted).length;
  const progress = userTasks.length ? Math.round((done / userTasks.length) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-white/10 bg-white dark:bg-white/[0.02] p-8 hover:border-indigo-500/50 transition-all duration-500 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
      {/* Decorative background glow */}
      <div 
        className="absolute -right-20 -top-20 h-40 w-40 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700" 
        style={{ backgroundColor: member.color }}
      />

      <div className="absolute right-6 top-6">
        <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-[2rem] text-2xl font-black text-white shadow-2xl transition-transform duration-500 group-hover:scale-110"
            style={{ 
              backgroundColor: member.color,
              boxShadow: `0 20px 40px -12px ${member.color}66`
            }}
          >
            {member.initials}
          </span>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 border-4 border-white dark:border-[#111] shadow-lg" title="Online" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            {member.name}
            {isCurrentUser && (
              <span className="text-[10px] bg-indigo-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                You
              </span>
            )}
          </h3>
          <p className="text-sm text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-[0.15em] mt-1">
            {member.role}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 group/link cursor-pointer hover:text-indigo-500 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 group-hover/link:bg-indigo-500/10">
            <Mail className="h-4 w-4" />
          </div>
          {member.email}
        </div>
        {member.role.toLowerCase().includes("admin") && (
          <div className="flex items-center gap-3 text-sm font-bold text-amber-500 bg-amber-500/5 px-4 py-2 rounded-2xl border border-amber-500/10 w-fit">
            <Shield className="h-4 w-4" /> Root Access
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Productivity</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {progress}% <span className="text-xs font-bold text-slate-400 ml-1">Velocity</span>
            </p>
          </div>
          <div className="text-right text-xs font-black text-slate-500 dark:text-slate-400">
            {done} / {userTasks.length} <span className="uppercase tracking-tighter">Tasks</span>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            style={{
              width: `${progress}%`,
              backgroundColor: member.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
