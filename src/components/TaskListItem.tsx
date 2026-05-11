"use client";
import { CheckCircle, Star, Trash2, Clock, AlertCircle, PlayCircle, CheckCircle2, Archive, MoreVertical, Paperclip } from "lucide-react";
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

  return (
    <div
      onClick={() => onSelect(task)}
      className={cn(
        "group relative flex items-center gap-4 px-4 py-2 border-b border-slate-100 dark:border-white/5 transition-all cursor-pointer",
        task.isCompleted 
          ? "bg-slate-50/50 dark:bg-white/[0.01] text-slate-500" 
          : "bg-white dark:bg-[#161b22] text-slate-900 dark:text-slate-100 font-medium",
        "hover:shadow-[inset_1px_0_0_#4f46e5,0_1px_3px_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] hover:z-10 dark:hover:shadow-none dark:hover:bg-white/[0.04]"
      )}
    >
      {/* Selection & Favorite */}
      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div 
          onClick={() => onToggleComplete(task.id, !task.isCompleted)}
          className={cn(
            "h-4 w-4 rounded border transition-all flex items-center justify-center",
            task.isCompleted 
              ? "bg-indigo-600 border-indigo-600" 
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
          )}
        >
          {task.isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
        </div>
        <button
          onClick={() => onPriorityChange(task.id, isHigh ? "MEDIUM" : "HIGH")}
          className={cn(
            "transition-all hover:scale-110",
            isHigh ? "text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-400"
          )}
        >
          <Star className={cn("h-4 w-4", isHigh && "fill-current")} />
        </button>
      </div>

      {/* Assignee / "Sender" */}
      <div className="w-32 hidden md:block shrink-0 truncate text-sm">
        <span className={cn(
          "px-2 py-0.5 rounded text-[11px] font-bold mr-2",
          isHigh ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
        )}>
          {task.priority[0]}
        </span>
        <span className={!task.isCompleted ? "font-bold" : ""}>
          {assignee?.name || "Unassigned"}
        </span>
      </div>

      {/* Subject & Snippet */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn(
          "truncate text-sm",
          !task.isCompleted ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-500"
        )}>
          {task.title}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-sm truncate font-normal">
          - {task.description || "No description provided"}
        </span>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 ml-2 shrink-0">
            {task.tags.slice(0, 1).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Date & Hover Actions */}
      <div className="flex items-center gap-4 shrink-0 min-w-[80px] justify-end">
        {/* Only visible on hover in Gmail, but we can toggle based on group-hover */}
        <div className="hidden group-hover:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onToggleComplete(task.id, !task.isCompleted)}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
            title={task.isCompleted ? "Mark as TODO" : "Archive (Mark as Done)"}
          >
            {task.isCompleted ? <Clock className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <span className={cn(
          "text-xs group-hover:hidden",
          !task.isCompleted ? "font-bold text-slate-900 dark:text-slate-300" : "text-slate-400"
        )}>
          {formattedDate || "No date"}
        </span>
      </div>
    </div>
  );
}
