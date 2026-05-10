"use client";
import { useState } from "react";
import { Plus, Search, ListTodo, CheckCircle, Clock, Star, BarChart3, ChevronDown, Trash2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useStore, Priority, Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import TaskDetailModal from "@/components/TaskDetailModal";

import { TaskList } from "@/components/TaskList";

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

  const handlePriorityChange = (id: string, priority: Priority) => {
    updateTask(id, { priority });
  };

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
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] py-4 pl-12 pr-6 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-lg shadow-slate-200/20 dark:shadow-none"
          />
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/50 dark:border-white/5 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth">
          {(["ALL", "HIGH", "MEDIUM", "LOW", "DONE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 shrink-0",
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
          <TaskList
            tasks={filtered}
            members={members}
            onToggleComplete={handleToggle}
            onDelete={deleteTask}
            onSelect={setSelectedTask}
            onPriorityChange={handlePriorityChange}
          />
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
