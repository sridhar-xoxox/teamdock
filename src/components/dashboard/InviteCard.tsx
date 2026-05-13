"use client";
import { Mail, Clock, X } from "lucide-react";
import { Invite } from "@/lib/store";

interface InviteCardProps {
  invite: Invite;
  isAdmin: boolean;
  onRemove: (email: string) => void;
}

export function InviteCard({ invite, isAdmin, onRemove }: InviteCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] p-8 opacity-80 hover:opacity-100 transition-all duration-300">
      {isAdmin && (
        <button
          onClick={() => onRemove(invite.email)}
          className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
          title="Revoke Invite"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <div className="flex items-center gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 dark:bg-white/5 text-slate-400 border border-dashed border-slate-300 dark:border-white/20">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-500 dark:text-slate-300 tracking-tight">
            Pending Invite
          </h3>
          <p className="text-sm text-indigo-500/70 font-black uppercase tracking-[0.15em] mt-1">
            {invite.role}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/50 dark:bg-white/[0.02]">
          <Mail className="h-4 w-4" />
        </div>
        {invite.email}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Awaiting Response</span>
      </div>
    </div>
  );
}
