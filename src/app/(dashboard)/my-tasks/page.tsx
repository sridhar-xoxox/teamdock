"use client";
import { useState } from "react";
import { Plus, Search, ListTodo, CheckCircle, Clock, Star, BarChart3, ChevronDown, Trash2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useStore, Priority, Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import TaskDetailModal from "@/components/TaskDetailModal";

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <div className={cn(
      "group relative flex items-center gap-4 rounded-3xl p-5",
      "bg-white/80 dark:bg-white/[0.03] backdrop-blur-md",
      "border border-slate-200/60 dark:border-white/10",
      "shadow-xl shadow-slate-200/20 dark:shadow-black/20",
      "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/30"
    )}>
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110",
        color
      )}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
      {/* Decorative gradient blur */}
      <div className={cn("absolute -right-2 -top-2 h-16 w-16 opacity-0 blur-2xl transition-opacity group-hover:opacity-20", color)} />
    </div>
  );
}

export default function MyTasksPage() {
  const { tasks, members, updateTask, deleteTask } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Priority | "DONE">("ALL");

  const handleToggle = (id: string, newIsCompleted: boolean) => {
    updateTask(id, { isCompleted: newIsCompleted, status: newIsCompleted ? "DONE" : "TODO" });
  };

  const getAssignee = (id?: string) => members.find(m => m.id === id);

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "DONE") return t.isCompleted && matchSearch;
    if (filter === "ALL") return matchSearch;
    return t.priority === filter && !t.isCompleted && matchSearch;
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  const highCount = tasks.filter((t) => t.priority === "HIGH" && !t.isCompleted).length;
  const overdue = tasks.filter((t) => t.dueDate && !t.isCompleted && new Date(t.dueDate) < new Date()).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex h-full flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-3">
            <span className="h-1 w-8 rounded-full bg-indigo-500" />
            Workspace Analytics
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-6xl">
            My <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Tasks</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/add-task"
            className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-500/40 transition-all hover:bg-indigo-500 hover:-translate-y-1 hover:shadow-indigo-500/60 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus className="h-5 w-5" />
            Compose Task
          </Link>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle} label="Completed" value={done} color="bg-gradient-to-br from-emerald-500 to-teal-400" />
        <StatCard icon={BarChart3} label="Momentum" value={`${progress}%`} color="bg-gradient-to-br from-indigo-600 to-indigo-400" />
        <StatCard icon={Star} label="Critical" value={highCount} color="bg-gradient-to-br from-rose-500 to-orange-400" />
        <StatCard icon={Clock} label="Overdue" value={overdue} color="bg-gradient-to-br from-amber-500 to-yellow-400" />
      </div>

      {/* Control Bar */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search through tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] py-4 pl-12 pr-6 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/5">
          {(["ALL", "HIGH", "MEDIUM", "LOW", "DONE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                filter === f
                  ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-black/5"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Inbox Content */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.01] backdrop-blur-xl shadow-2xl">
        
        {/* Inbox Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center rounded-lg bg-indigo-500/10 p-2 text-indigo-500 hidden sm:flex">
              <List className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Task Queue</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
              {filtered.length} Results
            </span>
            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex gap-1">
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hidden sm:block"><LayoutGrid className="h-4 w-4" /></button>
              <button className="rounded-lg p-2 bg-indigo-500/10 text-indigo-500 hidden sm:block"><List className="h-4 w-4" /></button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 sm:hidden">
                {filtered.length} Tasks
              </span>
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-indigo-500 opacity-50" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">All Caught Up!</p>
              <p className="text-sm text-slate-500 max-w-xs">No tasks match your current filters. Enjoy the peace or create something new.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task) => {
                const assignee = getAssignee(task.assigneeId);
                const isHigh = task.priority === "HIGH";
                const dateObj = task.dueDate ? new Date(task.dueDate) : null;
                const formattedDate = dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";

                return (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "group relative flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 rounded-3xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border",
                      "bg-white/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05]",
                      "border-transparent hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-0.5",
                      task.isCompleted && "opacity-60"
                    )}
                  >
                    {/* Status Indicator Bar */}
                    <div className={cn(
                      "absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:block",
                      isHigh ? "bg-rose-500" : "bg-indigo-500"
                    )} />

                    {/* Checkbox / Star */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div 
                        onClick={() => handleToggle(task.id, !task.isCompleted)}
                        className={cn(
                          "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border-2 transition-all cursor-pointer",
                          task.isCompleted 
                            ? "bg-emerald-500 border-emerald-500" 
                            : "border-slate-300 dark:border-white/10 hover:border-indigo-500"
                        )}
                      >
                        {task.isCompleted && <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      </div>
                      <button 
                        onClick={() => updateTask(task.id, { priority: isHigh ? "MEDIUM" : "HIGH" })}
                        className={cn(
                          "transition-all duration-300 hover:scale-125",
                          isHigh ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-300 dark:text-white/10 hover:text-amber-400"
                        )}
                      >
                        <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", isHigh && "fill-current")} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 w-full sm:w-auto order-3 sm:order-none mt-2 sm:mt-0">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-base sm:text-lg font-black tracking-tight truncate",
                          task.isCompleted ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                        )}>
                          {task.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5 sm:mt-1">
                          {task.description || "No description provided"}
                        </p>
                      </div>

                      {/* Meta Tags */}
                      <div className="hidden sm:flex flex-wrap items-center gap-2 shrink-0">
                        {task.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-xl bg-indigo-500/5 dark:bg-white/5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 dark:border-white/5 uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Meta Section */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0 ml-auto order-2 sm:order-none">
                      {/* Assignee */}
                      {assignee && (
                        <div className="relative group/user">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl text-xs sm:text-sm font-black text-white shadow-lg ring-2 sm:ring-4 ring-white dark:ring-[#111] transition-transform group-hover/user:scale-110" style={{ backgroundColor: assignee.color }}>
                            {assignee.initials}
                          </div>
                        </div>
                      )}

                      {/* Date / Actions Toggle */}
                      <div className="w-auto sm:w-20 flex justify-end">
                        <span className={cn(
                          "text-[10px] sm:text-xs font-black tracking-tighter text-slate-400 sm:group-hover:hidden transition-all",
                          task.isCompleted ? "text-slate-300" : "text-slate-900 dark:text-slate-400"
                        )}>
                          {formattedDate}
                        </span>
                        <div className="hidden sm:group-hover:flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail View */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
