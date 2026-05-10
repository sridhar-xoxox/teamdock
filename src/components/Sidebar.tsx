"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kanban, ListTodo, Users, BarChart3, Settings, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/Logo";

const NAV = [
  { href:"/board",     label:"Board",    icon:Kanban },
  { href:"/my-tasks",  label:"My Tasks", icon:ListTodo },
  { href:"/team",      label:"Team",     icon:Users },
  { href:"/analytics", label:"Analytics",icon:BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();
  const { tasks, activeWorkspace } = useStore();
  const pending = tasks.filter(t => !t.isCompleted).length;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 text-slate-900 dark:text-white">
        <Logo className="h-8 w-8" />
        <span className="text-2xl font-bold tracking-tight">
          teamdock
        </span>
      </div>

      {/* Workspace badge */}
      <div className="mx-4 mb-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 transition-colors">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeWorkspace?.name || "TeamDock MVP"}</p>
        <p className="text-[10px] text-slate-500">{pending} tasks remaining</p>
      </div>

      {/* Compose Button */}
      <div className="px-4 pb-4">
        <Link href="/add-task" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-indigo-500/40">
          <Plus className="h-4 w-4" /> Compose Task
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100"
              )}>
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-500 dark:text-indigo-400" : "")} />
              {label}
              {label === "My Tasks" && pending > 0 && (
                <span className="ml-auto rounded-full bg-indigo-100 dark:bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 dark:border-white/10 p-3 space-y-1">
        <Link href="/settings" className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          path === "/settings" 
            ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100"
        )}>
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
