"use client";
import { useState } from "react";
import { Plus, Search, CheckCircle, Star, Inbox, Archive, ChevronLeft, ChevronRight, FolderKanban, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useStore, Priority, Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { TaskList } from "@/components/dashboard/TaskList";

export default function MyTasksPage() {
  const { tasks: workspaceTasks, members, updateTask, deleteTask, projects, currentUser } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "DONE">("ALL");

  const isMember = currentUser?.role?.toLowerCase() === "member";

  // RBAC Filter: Members see only their own tasks
  const tasks = (isMember && currentUser) 
    ? workspaceTasks.filter(t => t.assigneeId === currentUser.id)
    : workspaceTasks;

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

  // Top 5 projects for the redesign
  const topProjects = projects
    .map(p => ({
      ...p,
      taskCount: tasks.filter(t => !t.isCompleted && t.projectId === p.id).length,
      doneCount: tasks.filter(t => t.isCompleted && t.projectId === p.id).length,
    }))
    .slice(0, 5);

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
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1">
          <div className="h-8" /> 
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span>1-{filtered.length} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 disabled:opacity-30" disabled><ChevronLeft className="h-4 w-4" /></button>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-400 disabled:opacity-30" disabled><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          <div className="flex flex-col items-start text-left">
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
          <div className="flex flex-col items-start text-left">
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
          <div className="flex flex-col items-start text-left">
            <span>Completed</span>
            <span className="text-[10px] font-medium text-slate-400">{done} archived</span>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* PREMIUM Projects UI - Sleek horizontal badges */}
        {filter === "ALL" && (
          <div className="px-6 py-4 border-b border-slate-200/40 dark:border-white/5 bg-slate-50/20 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500/80 dark:text-slate-400/80">Active Projects</h3>
              </div>
              <Link href="/board" className="group flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                All Projects <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {topProjects.map((proj) => {
                const totalProjTasks = proj.taskCount + proj.doneCount;
                const progress = totalProjTasks > 0 ? Math.round((proj.doneCount / totalProjTasks) * 100) : 0;
                
                return (
                  <div 
                    key={proj.id}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-sm transition-all group cursor-default"
                  >
                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white font-black text-[9px] shadow-sm",
                      proj.color || "bg-indigo-500"
                    )}>
                      {proj.name[0].toUpperCase()}
                    </div>
                    
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{proj.name}</span>
                    
                    <div className="flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-slate-100/50 dark:bg-white/5 border border-transparent group-hover:border-slate-200/50 dark:group-hover:border-white/10 transition-colors">
                      <span className="text-[9px] font-black text-indigo-500">{progress}%</span>
                      <div className="w-8 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={cn("h-full", proj.color || "bg-indigo-500")} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-50/40 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Zap className="h-2.5 w-2.5" />
                      <span className="text-[9px] font-black">{proj.taskCount}</span>
                    </div>

                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50/40 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-2.5 w-2.5" />
                      <span className="text-[9px] font-black">{proj.doneCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Task List */}
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

      {/* Floating Compose Button — hidden for Members */}
      {!isMember && (
        <Link
          href="/add-task"
          className="fixed right-8 bottom-8 flex items-center gap-3 bg-white dark:bg-[#1f2937] hover:bg-slate-50 dark:hover:bg-[#374151] px-6 py-4 rounded-2xl shadow-[0_1px_3px_0_rgba(60,64,67,0.30),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-all group active:scale-95"
        >
          <Plus className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-slate-700 dark:text-slate-200">Compose</span>
        </Link>
      )}

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
