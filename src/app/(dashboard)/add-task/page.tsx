"use client";
import { useState, KeyboardEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, Calendar, User, Flag, Layers, Send, Image as ImageIcon, X, UploadCloud, FolderKanban, ShieldX } from "lucide-react";
import { useStore, Priority, TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const PRIORITIES: { v: Priority; label: string; color: string }[] = [
  { v: "HIGH",   label: "High",   color: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 hover:bg-red-500/30" },
  { v: "MEDIUM", label: "Medium", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/30" },
  { v: "LOW",    label: "Low",    color: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40 hover:bg-blue-500/30" },
];
const STATUSES: { v: TaskStatus; label: string }[] = [
  { v: "TODO", label: "To Do" },
  { v: "IN_PROGRESS", label: "In Progress" },
  { v: "DONE", label: "Done" },
];

export default function AddTaskPage() {
  const router = useRouter();
  const { addTask, members, projects, activeWorkspace, currentUser } = useStore();

  const role = currentUser?.role?.toLowerCase();
  const canCreateTask = role === "admin" || role === "manager";

  // Members cannot create tasks — redirect them
  useEffect(() => {
    if (currentUser && !canCreateTask) {
      router.replace("/my-tasks");
    }
  }, [currentUser, canCreateTask, router]);

  if (currentUser && !canCreateTask) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <ShieldX className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-xs">Members can only interact with tasks assigned to them. Contact your Admin or Manager to create tasks.</p>
        <button onClick={() => router.push("/my-tasks")} className="mt-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors">
          Back to My Tasks
        </button>
      </div>
    );
  }

  const [projectId, setProjectId]   = useState("");
  const [title, setTitle]           = useState("");
  const [desc, setDesc]             = useState("");
  const [priority, setPriority]     = useState<Priority>("MEDIUM");
  const [status, setStatus]         = useState<TaskStatus>("TODO");
  const [dueDate, setDueDate]       = useState("");
  const [assigneeId, setAssignee]   = useState("");
  const [tagInput, setTagInput]     = useState("");
  const [tags, setTags]             = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError]           = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setAttachments(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    addTask({
      title: title.trim(),
      description: desc.trim() || undefined,
      priority,
      status,
      isCompleted: status === "DONE",
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      tags,
      attachments,
      workspaceId: activeWorkspace?.id,
      projectId: projectId || undefined,
    });
    router.push("/my-tasks");
  };

  return (
    <div className="flex h-full flex-col p-8 max-w-4xl mx-auto w-full">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-white dark:bg-white/5 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-transparent shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Compose Task</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Create a new task for your workspace</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
        >
          <Send className="h-4 w-4" />
          Publish Task
        </button>
      </header>

      <div className="flex-1 space-y-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 backdrop-blur-sm shadow-xl overflow-y-auto custom-scrollbar">

        {/* Title */}
        <div>
          <input
            autoFocus
            value={title}
            onChange={e => { setTitle(e.target.value); setError(""); }}
            placeholder="Task Title..."
            className="w-full bg-transparent text-3xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-red-500 font-semibold">{error}</p>}
        </div>

        <hr className="border-slate-200 dark:border-white/10" />

        {/* Description */}
        <textarea
          rows={5}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Add a detailed description..."
          className="w-full resize-none bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-lg leading-relaxed"
        />

        {/* Attachments */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
          <label className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <ImageIcon className="h-4 w-4" /> Visual Attachments
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-8 transition-all duration-300",
              isDragging
                ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
            )}
          >
            <input
              type="file" multiple accept="image/*"
              onChange={e => handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Drop images here or click to browse</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">PNG, JPG, WEBP • Max 5MB</p>
              </div>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {attachments.map((src, i) => (
                <div key={i} className="group relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties Grid */}
        <div className="grid gap-6 sm:grid-cols-2 pt-6 border-t border-slate-200 dark:border-white/10">
          {/* Status */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Layers className="h-4 w-4" /> Status
            </label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s.v} onClick={() => setStatus(s.v)}
                  className={cn("flex-1 rounded-xl border py-3 text-xs font-bold transition-all",
                    status === s.v
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Flag className="h-4 w-4" /> Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p.v} onClick={() => setPriority(p.v)}
                  className={cn("flex-1 rounded-xl border py-3 text-xs font-bold transition-all", p.color,
                    priority === p.v
                      ? "ring-2 ring-offset-2 dark:ring-offset-[#0d1117] ring-current shadow-lg"
                      : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20"
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" /> Due Date
            </label>
            <input
              type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Project */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <FolderKanban className="h-4 w-4" /> Project
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-400">No project (optional)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <User className="h-4 w-4" /> Assignee
            </label>
            <select
              value={assigneeId} onChange={e => setAssignee(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-900">Unassigned</option>
              {members.map(m => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900">{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Tag className="h-4 w-4" /> Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {tag}
                <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="hover:text-red-500 ml-1 text-indigo-400 transition-colors">×</button>
              </span>
            ))}
          </div>
          <input
            value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey} onBlur={addTag}
            placeholder="Type a tag and press Enter..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
}
