"use client";
import { useState } from "react";
import { Plus, Search, ListTodo, CheckCircle, Clock, Star, BarChart3, ChevronDown, Trash2, LayoutGrid, List, Inbox, Shield, Archive, Info, Settings, Menu, RefreshCw, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useStore, Priority, Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskList } from "@/components/TaskList";

export default function MyTasksPage() {
  const { tasks, members, updateTask, deleteTask } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "DONE">("ALL");

  const handleToggle = (id: string, newIsCompleted: boolean) => {
    updateTask(id, { isCompleted: newIsCompleted, status: newIsCompleted ? "DONE" : "TODO" });
  };

  const handlePriorityChange = (id: string, priority: Priority) => {
    updateTask(id, { priority });
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                       t.description?.toLowerCase().includes(search.toLowerCase());
    if (filter === "DONE") return t.isCompleted && matchSearch;
    if (filter === "HIGH") return t.priority === "HIGH" && !t.isCompleted && matchSearch;
    return !t.isCompleted && matchSearch;
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  const highCount = tasks.filter((t) => t.priority === "HIGH" && !t.isCompleted).length;
  const todoCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Gmail-style Search Header - Glassmorphic */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-[#0d1117]/60 backdrop-blur-xl shrink-0">
        <div className="flex-1 max-w-3xl relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input 
            type="text"
            placeholder="Search in tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:shadow-md border rounded-lg py-2.5 pl-12 pr-4 text-sm transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500"><Settings className="h-5 w-5" /></button>
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">U</div>
        </div>
      </div>

      {/* Gmail-style Action Bar - Glassmorphic */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1">
          <div className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 cursor-pointer"><RefreshCw className="h-4 w-4" /></div>
          <div className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 cursor-pointer"><MoreVertical className="h-4 w-4" /></div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span>1-{filtered.length} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 disabled:opacity-30" disabled><ChevronLeft className="h-4 w-4" /></button>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 disabled:opacity-30" disabled><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Gmail-style Tabs - Glassmorphic */}
      <div className="flex items-center border-b border-slate-200/50 dark:border-white/5 shrink-0 overflow-x-auto no-scrollbar bg-white/20 dark:bg-transparent backdrop-blur-sm">
        <button 
          onClick={() => setFilter("ALL")}
          className={cn(
            "flex items-center gap-4 px-6 py-4 text-sm font-bold border-b-4 transition-all min-w-[200px]",
            filter === "ALL" 
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20" 
              : "border-transparent text-slate-500 hover:bg-white/40 dark:hover:bg-white/5"
          )}
        >
          <Inbox className={cn("h-5 w-5", filter === "ALL" ? "text-indigo-600" : "text-slate-400")} />
          <div className="flex flex-col items-start">
            <span>Primary</span>
            <span className="text-[10px] font-medium text-slate-400">{todoCount} new tasks</span>
          </div>
        </button>

        <button 
          onClick={() => setFilter("HIGH")}
          className={cn(
            "flex items-center gap-4 px-6 py-4 text-sm font-bold border-b-4 transition-all min-w-[200px]",
            filter === "HIGH" 
              ? "border-rose-500 text-rose-500 bg-rose-50/20" 
              : "border-transparent text-slate-500 hover:bg-white/40 dark:hover:bg-white/5"
          )}
        >
          <Star className={cn("h-5 w-5", filter === "HIGH" ? "text-rose-500" : "text-slate-400")} />
          <div className="flex flex-col items-start">
            <span>Critical</span>
            <span className="text-[10px] font-medium text-slate-400">{highCount} high priority</span>
          </div>
        </button>

        <button 
          onClick={() => setFilter("DONE")}
          className={cn(
            "flex items-center gap-4 px-6 py-4 text-sm font-bold border-b-4 transition-all min-w-[200px]",
            filter === "DONE" 
              ? "border-emerald-500 text-emerald-500 bg-emerald-50/20" 
              : "border-transparent text-slate-500 hover:bg-white/40 dark:hover:bg-white/5"
          )}
        >
          <Archive className={cn("h-5 w-5", filter === "DONE" ? "text-emerald-500" : "text-slate-400")} />
          <div className="flex flex-col items-start">
            <span>Completed</span>
            <span className="text-[10px] font-medium text-slate-400">{done} archived</span>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <TaskList
          tasks={filtered}
          members={members}
          onToggleComplete={handleToggle}
          onDelete={deleteTask}
          onSelect={setSelectedTask}
          onPriorityChange={handlePriorityChange}
        />
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
              <Inbox className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your {filter.toLowerCase()} tab is empty.</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Nice work! You've cleared your queue.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button - Gmail style */}
      <Link
        href="/add-task"
        className="fixed right-8 bottom-8 flex items-center gap-3 bg-white dark:bg-[#1f2937] hover:bg-slate-50 dark:hover:bg-[#374151] px-6 py-4 rounded-2xl shadow-[0_1px_3px_0_rgba(60,64,67,0.30),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-all group active:scale-95"
      >
        <Plus className="h-6 w-6 text-indigo-600" />
        <span className="font-bold text-slate-700 dark:text-slate-200">Compose</span>
      </Link>

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
