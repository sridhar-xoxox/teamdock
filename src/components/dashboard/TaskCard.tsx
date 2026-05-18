"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarDays,
  User,
  AlertCircle,
  Minus,
  ArrowDown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  isCompleted: boolean;
  dueDate?: string | Date;
  assigneeName?: string;
  assigneeAvatar?: string;
  tags?: string[];
  onToggleComplete: (id: string, value: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority Config
// ─────────────────────────────────────────────────────────────────────────────

const priorityConfig: Record<
  Priority,
  { label: string; icon: React.FC<{ className?: string }>; classes: string }
> = {
  HIGH: {
    label: "High",
    icon: AlertCircle,
    classes:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60",
  },
  MEDIUM: {
    label: "Medium",
    icon: Minus,
    classes:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60",
  },
  LOW: {
    label: "Low",
    icon: ArrowDown,
    classes:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date() && d.toDateString() !== new Date().toDateString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown Menu (Removed)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// ─────────────────────────────────────────────────────────────────────────────

export function TaskCard({
  id,
  title,
  description,
  priority,
  isCompleted,
  dueDate,
  assigneeName,
  assigneeAvatar,
  tags = [],
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const { label, icon: PriorityIcon, classes } = priorityConfig[priority];
  const overdue = dueDate && !isCompleted && isOverdue(dueDate);

  return (
    <article
      id={`task-card-${id}`}
      aria-label={`Task: ${title}`}
      className={cn(
        // Base
        "group relative flex flex-col gap-3 rounded-2xl p-4",
        "bg-white dark:bg-slate-900",
        "border border-slate-200/80 dark:border-slate-700/60",
        // Hover — subtle lift + glow
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/8",
        "hover:border-indigo-300/60 dark:hover:border-indigo-600/50",
        // Completed dimming
        isCompleted && "opacity-60"
      )}
    >
      {/* Top row — checkbox + title + menu */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          id={`task-toggle-${id}`}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          onClick={() => onToggleComplete(id, !isCompleted)}
          className="mt-0.5 shrink-0 text-slate-400 transition-colors duration-150 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100",
              isCompleted && "line-through decoration-slate-400/70"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {/* Delete Button */}
        <div className="relative shrink-0">
          <button
            aria-label="Delete task"
            onClick={() => onDelete(id)}
            className={cn(
              "rounded-lg p-1.5 transition-colors duration-150",
              "text-slate-400 opacity-0 group-hover:opacity-100",
              "hover:bg-red-50 hover:text-red-600",
              "dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-8">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row — priority badge + due date + assignee */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pl-8">
        {/* Priority Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
            classes
          )}
        >
          <PriorityIcon className="h-2.5 w-2.5" />
          {label}
        </span>

        {/* Status Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
            isCompleted 
              ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-2.5 w-2.5" />
              Done
            </>
          ) : (
            <>
              <Clock className="h-2.5 w-2.5" />
              To Do
            </>
          )}
        </span>

        {/* Due Date */}
        {dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
              overdue
                ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <CalendarDays className="h-2.5 w-2.5" />
            {formatDate(dueDate)}
          </span>
        )}

        {/* Assignee */}
        {assigneeName && (
          <div className="flex items-center gap-1.5 min-w-0 ml-auto">
            {assigneeAvatar ? (
              <img
                src={assigneeAvatar}
                alt={assigneeName}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 shrink-0">
                <User className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              </span>
            )}
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {assigneeName}
            </span>
          </div>
        )}
      </div>

      {/* Left accent bar keyed to priority */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
          priority === "HIGH" && "bg-red-400 dark:bg-red-500",
          priority === "MEDIUM" && "bg-amber-400 dark:bg-amber-500",
          priority === "LOW" && "bg-blue-400 dark:bg-blue-500"
        )}
      />
    </article>
  );
}
