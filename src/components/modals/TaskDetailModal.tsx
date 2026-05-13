"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Clock, Star, MoreVertical, MessageSquare, Archive, Reply, Calendar, Paperclip, Maximize2, X } from "lucide-react";
import { useStore, Task } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task: initialTask, onClose }: Props) {
  const { deleteTask, updateTask, members, currentUser, addTaskComment, tasks } = useStore();
  const [message, setMessage] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Always get the latest task data from the store
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;
  
  const assignee = members.find(m => m.id === task.assigneeId);
  const isHigh = task.priority === "HIGH";

  const dateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dateObj && dateObj < new Date() && !task.isCompleted;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { 
      if (e.key === "Escape") {
        if (activeImage) setActiveImage(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, activeImage]);

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const toggleComplete = () => {
    updateTask(task.id, { isCompleted: !task.isCompleted, status: !task.isCompleted ? "DONE" : "TODO" });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentUser) return;
    addTaskComment(task.id, currentUser.id, message.trim());
    setMessage("");
  };

  const getCommenter = (id: string) => members.find(m => m.id === id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Subtle Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Gmail-style Detail Panel */}
      <div className="relative h-full w-full max-w-4xl flex flex-col bg-white dark:bg-[#0d1117] shadow-2xl animate-in slide-in-from-right duration-300 sm:rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
        
        {/* Gmail Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500" title="Back to inbox">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
            <button onClick={toggleComplete} className={cn("p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full", task.isCompleted ? "text-emerald-500" : "text-slate-500")} title="Mark as done">
              <Archive className="h-5 w-5" />
            </button>
            <button onClick={handleDelete} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500" title="Delete">
              <Trash2 className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500" title="Snooze">
              <Clock className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d1117]">
          
          {/* Email Subject Line */}
          <div className="px-6 sm:px-16 pt-8 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <h1 className="text-xl sm:text-2xl font-normal text-slate-900 dark:text-slate-100 min-w-0 break-words">
                    {task.title}
                  </h1>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase shrink-0",
                    isHigh ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  )}>
                    {task.priority}
                  </div>
                </div>

                {/* HIGHLIGHTED DUE DATE SECTION */}
                {task.dueDate && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                      isOverdue 
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800 animate-pulse" 
                        : "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-800"
                    )}>
                      <Calendar className="h-4 w-4" />
                      <span>DUE DATE: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      {isOverdue && <span className="ml-2 bg-rose-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase">Overdue</span>}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {task.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-slate-300 dark:text-slate-600 hover:text-amber-400">
                <Star className={cn("h-5 w-5", isHigh && "fill-current text-amber-400")} />
              </button>
            </div>
          </div>

          {/* Sender / Assignee Info Row */}
          <div className="px-6 sm:px-16 py-4 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: assignee?.color || '#6366f1' }}>
              {assignee?.initials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-sm">
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{assignee?.name || 'Unassigned'}</span>
                  <span className="text-slate-500 text-[11px] sm:text-xs font-normal truncate">&lt;{assignee?.email || 'noreply@teamdock.com'}&gt;</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] sm:text-xs text-slate-500 font-normal">
                  <span className="shrink-0">{task.createdAt ? new Date(task.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded"><Reply className="h-4 w-4" /></button>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded"><MoreVertical className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">to me</p>
            </div>
          </div>

          {/* Email Body / Task Description */}
          <div className="px-6 sm:px-24 py-8 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {task.description || 'No detailed instructions provided for this objective.'}
          </div>

          {/* Visual Attachments Section - NO CROP PREVIEW */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="px-6 sm:px-24 py-8 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-6 text-slate-500">
                <Paperclip className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Attachments ({task.attachments.length})</span>
              </div>
              <div className="flex flex-wrap gap-6">
                {task.attachments.map((src, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(src)}
                    className="group relative rounded-2xl border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-white/5 p-2 w-48 h-48 cursor-pointer hover:border-indigo-500 transition-all shadow-sm"
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                      <img src={src} alt="" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <Maximize2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Thread / Update Board */}
          <div className="px-6 sm:px-24 py-8 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-8 text-slate-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Updates ({task.comments?.length || 0})</span>
            </div>
            
            <div className="space-y-8">
              {task.comments?.map((comment) => {
                const commenter = getCommenter(comment.memberId);
                return (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1" style={{ backgroundColor: commenter?.color || '#6366f1' }}>
                      {commenter?.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{commenter?.name}</span>
                        <span className="text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Area */}
          <div className="px-6 sm:px-24 py-12">
            {!message && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setMessage(" ")}
                  className="flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  <Reply className="h-4 w-4" /> Reply
                </button>
              </div>
            )}
            
            {message && (
              <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 border-b border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  <Reply className="h-3 w-3" /> Replying to {assignee?.name}
                </div>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-white dark:bg-[#0d1117] p-4 text-sm min-h-[150px] outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
                <div className="px-4 py-3 bg-white dark:bg-[#0d1117] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button 
                    onClick={handleSendMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md text-sm transition-all flex items-center gap-2"
                  >
                    Send
                  </button>
                  <button onClick={() => setMessage("")} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* LIGHTBOX MODAL - NO CROP */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300"
          onClick={() => setActiveImage(null)}
        >
          <button 
            onClick={() => setActiveImage(null)}
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[210]"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 sm:p-8">
            <img 
              src={activeImage} 
              alt="Full size attachment" 
              className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-lg animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
