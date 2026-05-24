"use client";
import { Task, Member, Priority } from "@/lib/store";
import { TaskListItem } from "./TaskListItem";
import { CheckCircle } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  members: Member[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onSelect: (task: Task) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

export function TaskList({
  tasks,
  members,
  onToggleComplete,
  onDelete,
  onSelect,
  onPriorityChange,
}: TaskListProps) {
  const getAssignee = (id?: string) => members.find((m) => m.id === id);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-indigo-500 opacity-50" />
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          All Caught Up!
        </p>
        <p className="text-sm text-slate-500 max-w-xs">
          No tasks match your current filters. Enjoy the peace or create something new.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          assignee={getAssignee(task.assigneeId)}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onSelect={onSelect}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  );
}
