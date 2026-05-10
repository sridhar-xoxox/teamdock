"use client";
import { CheckCircle, Star, Trash2, Clock, AlertCircle, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, Member, Priority, TaskStatus } from "@/lib/store";

interface TaskListItemProps {
  task: Task;
  assignee?: Member;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onSelect: (task: Task) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

const statusConfig: Record<TaskStatus, { label: string, icon: any, classes: string }> = {
  TODO: { 
    label: "To Do", 
    icon: Clock, 
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800" 
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    icon: PlayCircle, 
    classes: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800" 
  },
  DONE: { 
    label: "Completed", 
    icon: CheckCircle2, 
    classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
  },
};

const priorityConfig: Record<Priority, { label: string, icon: any, classes: string }> = {
  HIGH: { 
    label: "High", 
    icon: AlertCircle, 
    classes: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-800" 
  },
  MEDIUM: { 
    label: "Medium", 
    icon: Star, 
    classes: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-800" 
  },
  LOW: { 
    label: "Low", 
    icon: Star, 
    classes: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-800" 
  },
};

export function TaskListItem({
  task,
  assignee,
  onToggleComplete,
  onDelete,
  onSelect,
  onPriorityChange,
}: TaskListItemProps) {
  const isHigh = task.priority === "HIGH";
  const dateObj = task.dueDate ? new Date(task.dueDate) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <div
      onClick={() => onSelect(task)}
      className={cn(
        "group relative flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 rounded-3xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border",
        "bg-white/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05]",
        "border-transparent hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-0.5",
        task.isCompleted && "opacity-60"
      )}
    >
      {/* Status Indicator Bar */}
      <div
        className={cn(
          "absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:block",
          isHigh ? "bg-rose-500" : "bg-indigo-500"
        )}
      />

      {/* Checkbox / Star */}
      <div
        className="flex items-center gap-2 sm:gap-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onClick={() => onToggleComplete(task.id, !task.isCompleted)}
          className={cn(
            "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border-2 transition-all cursor-pointer",
            task.isCompleted
              ? "bg-emerald-500 border-emerald-500"
              : "border-slate-300 dark:border-white/10 hover:border-indigo-500"
          )}
        >
          {task.isCompleted && (
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          )}
        </div>
        <button
          onClick={() => onPriorityChange(task.id, isHigh ? "MEDIUM" : "HIGH")}
          className={cn(
            "transition-all duration-300 hover:scale-125",
            isHigh
              ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              : "text-slate-300 dark:text-white/10 hover:text-amber-400"
          )}
        >
          <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", isHigh && "fill-current")} />
        </button>
      </div>

      {/* Content Section */}
      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 w-full sm:w-auto order-3 sm:order-none mt-2 sm:mt-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Status Badge */}
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-colors",
              status.classes
            )}>
              <status.icon className="h-2.5 w-2.5" />
              {status.label}
            </span>

            {/* Priority Badge */}
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-colors",
              priority.classes
            )}>
              <priority.icon className="h-2.5 w-2.5" />
              {priority.label}
            </span>
          </div>

          <h3
            className={cn(
              "text-base sm:text-lg font-black tracking-tight truncate",
              task.isCompleted
                ? "text-slate-400 line-through"
                : "text-slate-900 dark:text-white"
            )}
          >
            {task.title}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5 sm:mt-1">
            {task.description || "No description provided"}
          </p>
        </div>

        {/* Meta Tags */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 shrink-0">
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-xl bg-indigo-500/5 dark:bg-white/5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 dark:border-white/5 uppercase tracking-tighter"
            >
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
            <div
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl text-xs sm:text-sm font-black text-white shadow-lg ring-2 sm:ring-4 ring-white dark:ring-[#111] transition-transform group-hover/user:scale-110"
              style={{ backgroundColor: assignee.color }}
            >
              {assignee.initials}
            </div>
          </div>
        )}

        {/* Date / Actions Toggle */}
        <div className="w-auto sm:w-20 flex justify-end">
          <span
            className={cn(
              "text-[10px] sm:text-xs font-black tracking-tighter text-slate-400 sm:group-hover:hidden transition-all",
              task.isCompleted
                ? "text-slate-300"
                : "text-slate-900 dark:text-slate-400"
            )}
          >
            {formattedDate}
          </span>
          <div className="hidden sm:group-hover:flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
