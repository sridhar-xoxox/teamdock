"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { X, Tag, Calendar, User, AlignLeft, Flag, Layers } from "lucide-react";
import { useStore, Priority, TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props { onClose: () => void; defaultStatus?: TaskStatus; }

const PRIORITIES: { v: Priority; label: string; color: string }[] = [
  { v:"HIGH",   label:"High",   color:"bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 hover:bg-red-500/30" },
  { v:"MEDIUM", label:"Medium", color:"bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/30" },
  { v:"LOW",    label:"Low",    color:"bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40 hover:bg-blue-500/30" },
];
const STATUSES: { v: TaskStatus; label: string }[] = [
  { v:"TODO", label:"To Do" }, { v:"IN_PROGRESS", label:"In Progress" }, { v:"DONE", label:"Done" },
];

export default function AddTaskModal({ onClose, defaultStatus = "TODO" }: Props) {
  const { addTask, members } = useStore();
  const [title, setTitle]         = useState("");
  const [desc, setDesc]           = useState("");
  const [priority, setPriority]   = useState<Priority>("MEDIUM");
  const [status, setStatus]       = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate]     = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [tagInput, setTagInput]   = useState("");
  const [tags, setTags]           = useState<string[]>([]);
  const [error, setError]         = useState("");

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  const handleSubmit = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    addTask({ title:title.trim(), description:desc.trim()||undefined, priority, status,
      isCompleted: status==="DONE", dueDate:dueDate||undefined,
      assigneeId:assigneeId||undefined, tags });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">New Task</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <AlignLeft className="h-3 w-3" /> Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {error && <p className="mt-1 text-xs text-red-500 font-semibold">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <AlignLeft className="h-3 w-3" /> Description
            </label>
            <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details..."
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Flag className="h-3 w-3" /> Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p.v} onClick={() => setPriority(p.v)}
                  className={cn("flex-1 rounded-xl border py-2 text-xs font-bold transition-all", p.color,
                    priority === p.v ? "ring-2 ring-offset-2 dark:ring-offset-[#111827] ring-current shadow-lg" : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-slate-200 dark:border-white/10")}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Layers className="h-3 w-3" /> Status
            </label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s.v} onClick={() => setStatus(s.v)}
                  className={cn("flex-1 rounded-xl border py-2 text-xs font-bold transition-all",
                    status === s.v
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10")}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date + Assignee row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Calendar className="h-3 w-3" /> Due Date
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <User className="h-3 w-3" /> Assignee
              </label>
              <select value={assigneeId} onChange={e => setAssignee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer">
                <option value="" className="bg-white dark:bg-slate-900">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900">{m.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Tag className="h-3 w-3" /> Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {tag}
                  <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey} onBlur={addTag}
              placeholder="Type tag, press Enter…"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
