"use client";
import { useState } from "react";
import { Plus, Search, LayoutDashboard, ChevronDown } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import Link from "next/link";
import { useStore, TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "bg-slate-200/50 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" },
  { id: "DONE", label: "Done", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
];

export default function BoardPage() {
  const { tasks, members, updateTask, deleteTask } = useStore();
  const [search, setSearch] = useState("");

  const handleToggle = (id: string, newIsCompleted: boolean) => {
    if (newIsCompleted) {
      // Mark as done and move to done list
      updateTask(id, { isCompleted: true, status: "DONE" });
    } else {
      // If already done and clicked again, delete the task details
      deleteTask(id);
    }
  };
  

  const getAssignee = (id?: string) => members.find(m => m.id === id);

  return (
    <div className="flex h-full flex-col p-4 sm:p-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mb-1 font-black uppercase tracking-widest">
            <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Workspace</span>
            <ChevronDown className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Kanban Board</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Task Board</h1>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>
          <Link
            href="/add-task"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Link>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

          return (
            <div key={col.id} className="flex w-[300px] sm:w-[350px] shrink-0 flex-col rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 shadow-sm snap-center">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{col.label}</h3>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", col.color)}>
                    {colTasks.length}
                  </span>
                </div>
                <Link 
                  href="/add-task"
                  className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    priority={task.priority}
                    isCompleted={task.isCompleted}
                    dueDate={task.dueDate}
                    assigneeName={getAssignee(task.assigneeId)?.name}
                    tags={task.tags}
                    onToggleComplete={handleToggle}
                    onEdit={() => {}}
                    onDelete={deleteTask}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-6 text-center text-sm text-slate-500 font-medium">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
