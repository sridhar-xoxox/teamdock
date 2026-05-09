"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, CheckCircle, Clock, Star, MoreVertical, Sparkles, Send } from "lucide-react";
import { useStore, Task } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: Props) {
  const { deleteTask, updateTask, members } = useStore();
  const [message, setMessage] = useState("");
  const assignee = members.find(m => m.id === task.assigneeId);
  const isHigh = task.priority === "HIGH";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const toggleComplete = () => {
    updateTask(task.id, { isCompleted: !task.isCompleted, status: !task.isCompleted ? "DONE" : "TODO" });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Mock behavior: message sent
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-all duration-500" onClick={onClose} />

      {/* Main Panel */}
      <div className="relative h-full w-full max-w-2xl flex flex-col bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 ease-out sm:rounded-[3rem] border-l sm:border border-white/20 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        {/* Toolbar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <button onClick={onClose} className="group flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-2 text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            BACK
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleComplete}
              className={cn(
                "rounded-2xl p-3 transition-all shadow-lg active:scale-95",
                task.isCompleted 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-emerald-500"
              )}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <button onClick={handleDelete} className="rounded-2xl p-3 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">
              <Trash2 className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
            <button className="rounded-2xl p-3 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-10">
          
          {/* Badge & Title */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-[10px] font-black text-indigo-500 border border-indigo-500/20 uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Task Intelligence
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                isHigh ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
              )}>
                {task.priority} Priority
              </div>
            </div>

            <div className="flex items-start justify-between gap-6">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] flex-1">
                {task.title}
              </h1>
              <button 
                className={cn(
                  "mt-2 shrink-0 transition-all duration-500 hover:scale-125",
                  isHigh ? "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" : "text-slate-200 dark:text-white/5 hover:text-amber-400"
                )}
              >
                <Star className={cn("h-8 w-8", isHigh && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] p-6 border border-slate-200/50 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Ownership</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl shadow-xl flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: assignee?.color || '#6366f1' }}>
                  {assignee?.initials || 'U'}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{assignee?.name || 'Unassigned'}</p>
                  <p className="text-[10px] font-bold text-indigo-500">{assignee?.role || 'Contributor'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] p-6 border border-slate-200/50 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Timeline</p>
              <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Deadline'}</p>
                  <p className="text-[10px] font-bold text-slate-500">{task.dueDate ? new Date(task.dueDate).getFullYear() : 'Schedule now'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Area */}
          <div className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Objective Details</p>
            <div className="relative rounded-[2.5rem] bg-indigo-500/[0.02] dark:bg-indigo-500/[0.05] p-8 border border-indigo-500/10">
              <div className="text-xl leading-relaxed text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap italic">
                "{task.description || 'No detailed instructions provided for this objective.'}"
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Classification</p>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="px-5 py-2 rounded-2xl bg-white dark:bg-white/5 text-[10px] font-black text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase tracking-widest shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modern Interactive Footer */}
        <div className="relative z-10 px-8 py-8 bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your update or message..."
                className="w-full rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-8 py-5 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all shadow-inner pr-20 text-slate-900 dark:text-white"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 transition-all active:scale-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
