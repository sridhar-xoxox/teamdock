"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Grid, ListTodo, Users, BarChart3, Settings, LogOut, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "/board", label: "Home", icon: Grid },
  { href: "/my-tasks", label: "My Tasks", icon: ListTodo },
  { href: "/team", label: "Team", icon: Users },
];


export default function Sidebar() {
  const path = usePathname();
  const {
    tasks, activeWorkspace, currentUser,
    projects, addProject, deleteProject, logoutSession
  } = useStore();

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const isMember = currentUser?.role?.toLowerCase() === "member";
  const isManager = currentUser?.role?.toLowerCase() === "manager";
  const canCreateProject = isAdmin || isManager;

  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const pending = tasks.filter(t => !t.isCompleted).length;

  const handleAddProject = async () => {
    const name = newProjectName.trim();
    if (name) {
      try {
        await addProject(name);
        setNewProjectName("");
        setAddingProject(false);
      } catch (e: any) {
        console.error("Sidebar add project error:", e?.message);
      }
    }
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 text-slate-950 dark:text-white">
        <Logo className="h-8 w-8 text-indigo-600 dark:text-white" />
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
      {!isMember && (
        <div className="px-4 pb-4">
          <Link href="/add-task" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-indigo-500/40">
            <Plus className="h-4 w-4" /> Compose Task
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="space-y-0.5 px-3">
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

      {/* Projects Section */}
      <div className="flex-1 mt-6 px-3 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <span>Projects</span>
          {canCreateProject && (
            <button
              onClick={() => setAddingProject(true)}
              className="rounded-md p-0.5 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {addingProject && (
          <div className="px-3 mb-2">
            <input
              autoFocus
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleAddProject();
                if (e.key === "Escape") { setAddingProject(false); setNewProjectName(""); }
              }}
              placeholder="Project name..."
              className="w-full rounded-lg bg-slate-50 dark:bg-white/5 border border-indigo-500/30 px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 px-1">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/2 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-sm transition-transform group-hover:scale-110",
                p.color || "bg-slate-400"
              )}>
                {p.name[0].toUpperCase()}
              </div>
              <span className="truncate flex-1 font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{p.name}</span>
              {isAdmin && (
                <button
                  onClick={() => deleteProject(p.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-200 dark:border-white/10 p-3 space-y-1">
        <Link href="/settings" className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          path === "/settings"
            ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        )}>
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <button 
          onClick={() => currentUser && logoutSession(currentUser.id)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left focus:outline-none"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
