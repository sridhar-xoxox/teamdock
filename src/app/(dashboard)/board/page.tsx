"use client";
import { useState, useEffect } from "react";
import { 
  Search, Settings, HelpCircle, TrendingUp, TrendingDown, Eye, Plus, 
  MoreVertical, MoreHorizontal, Filter, Bold, Italic, Underline, 
  Strikethrough, List, ListOrdered, ChevronDown, Bell, Grid, User,
  Calendar, Trash2, FolderKanban
} from "lucide-react";
import { useStore, Task, Member, Workspace, Project } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Helpers ---
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays > 1 && diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// --- Sub-components ---

const StatCard = ({ title, value, trend, trendValue, color }: { 
  title: string; value: string | number; trend: "up" | "down"; trendValue: string | number; color: string 
}) => (
  <div className="flex-1 min-w-[180px] p-5 rounded-2xl bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={cn("flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full", 
        trend === "up" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-orange-600 bg-orange-50 dark:bg-orange-500/10")}>
        {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {trendValue}
      </div>
    </div>
    <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">
      {value}
    </div>
  </div>
);

const SectionHeader = ({ title, children, count }: { title: string; children?: React.ReactNode; count?: number }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
      {count !== undefined && (
        <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-500 dark:text-slate-400">
          {count}
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
);

export default function DashboardPage() {
  const { 
    tasks, members, workspaces, currentUser, 
    allMembers, createWorkspace, switchSession, allTasks,
    projects, addProject, deleteProject
  } = useStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [notepadContent, setNotepadContent] = useState("");

  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("teamdock_notepad");
    if (saved) setNotepadContent(saved);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("teamdock_notepad", notepadContent);
    }
  }, [notepadContent, mounted]);

  if (!mounted) return null;

  // Calculated stats
  const realProjectsCount = projects.length;
  const realTasksCount = tasks.length;
  const realAssignedCount = tasks.filter(t => t.assigneeId === currentUser?.id).length;
  const realCompletedCount = tasks.filter(t => t.isCompleted).length;
  const realOverdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted).length;

  // Workspace Name Resolver
  const getWorkspaceName = (id: string) => workspaces.find(w => w.id === id)?.name || id;

  // Filter Data
  const assignedToMe = tasks.filter(t => t.assigneeId === currentUser?.id);
  const displayTasks = assignedToMe.length > 0 ? assignedToMe.slice(0, 5) : tasks.slice(0, 3);
  
  const displayPeople = members.length > 0 ? members : [
    { id: "m1", name: "Marc Atenson", email: "marcnine@gmail.com", color: "bg-indigo-100", initials: "MA" }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-transparent custom-scrollbar pb-10">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/40 dark:bg-[#0d1117]/40 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 px-8 py-5 mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="shrink-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Home</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">Monitor all of your projects and tasks here</p>
          </div>
          <div className="flex-1 max-w-2xl flex items-center gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-12 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-[#1a1f2e] focus:outline-none transition-all text-sm text-slate-900 dark:text-white shadow-inner"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-focus-within:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 bg-white dark:bg-white/10 shadow-sm">⌘</kbd>
                <kbd className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 bg-white dark:bg-white/10 shadow-sm">F</kbd>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 shadow-sm hover:shadow transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 shadow-sm hover:shadow transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 space-y-10">
        {/* Stats Row */}
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
          <StatCard title="Total Project" value={realProjectsCount || 0} trend="up" trendValue={2} color="text-indigo-600" />
          <StatCard title="Total Tasks" value={realTasksCount || 0} trend="up" trendValue={4} color="text-indigo-400" />
          <StatCard title="Assigned Tasks" value={realAssignedCount || 0} trend="down" trendValue={3} color="text-orange-500" />
          <StatCard title="Completed Tasks" value={realCompletedCount || 0} trend="up" trendValue={1} color="text-emerald-500" />
          <StatCard title="Overdue Tasks" value={realOverdueCount || 0} trend="up" trendValue={2} color="text-red-500" />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* Left Column (Assigned Tasks & People) */}
          <div className="col-span-12 lg:col-span-6 space-y-10">
            
            {/* Assigned Tasks Card */}
            <div className="p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="Assigned Tasks">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                    Nearest Due Date
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                  <button className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </SectionHeader>

              <div className="space-y-4">
                {displayTasks.length > 0 ? displayTasks.map((t) => (
                  <div key={t.id} className="group flex items-center justify-between p-5 rounded-2xl border border-slate-50 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-50/5 dark:hover:bg-indigo-500/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span className="truncate max-w-[150px]">{getWorkspaceName(t.workspaceId)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                          <div className="flex items-center gap-1.5 text-orange-500/80">
                            <Calendar className="h-3 w-3" />
                            {formatDate(t.dueDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="p-2.5 rounded-xl text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-400 hover:bg-white dark:hover:bg-white/10 shadow-none hover:shadow-sm transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                )) : (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-600 font-medium border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                    No tasks assigned to you yet
                  </div>
                )}
              </div>
              
              <Link href="/my-tasks" className="block w-full mt-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20">
                Show All Tasks
              </Link>
            </div>

            {/* People Section Card */}
            <div className="p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="People" count={displayPeople.length}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                    Frequent Collaborators
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                  <button className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </SectionHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {displayPeople.map((m: any) => (
                  <div key={m.id} className="group p-5 rounded-3xl border border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:border-indigo-500/20 transition-all text-center">
                    <div className={cn("w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-inner", m.color || "bg-slate-100 dark:bg-white/5")}>
                      {m.initials || m.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase()}
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-1">{m.name}</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter truncate px-2">{m.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Projects & Notepad) */}
          <div className="col-span-12 lg:col-span-6 space-y-10">
            
            {/* Projects Section Card */}
            <div className="p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="Projects" count={projects.length}>
                <button
                  onClick={() => { setAddingProject(true); setNewProjectName(""); }}
                  className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </SectionHeader>

              {/* Inline add project */}
              {addingProject && (
                <div className="mb-4 flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const name = newProjectName.trim();
                        if (name) addProject(name);
                        setAddingProject(false); setNewProjectName("");
                      }
                      if (e.key === "Escape") { setAddingProject(false); setNewProjectName(""); }
                    }}
                    placeholder="Project name..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-indigo-500/30 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => {
                      const name = newProjectName.trim();
                      if (name) addProject(name);
                      setAddingProject(false); setNewProjectName("");
                    }}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
                  >Add</button>
                  <button
                    onClick={() => { setAddingProject(false); setNewProjectName(""); }}
                    className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >Cancel</button>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {projects.length === 0 && !addingProject && (
                  <div className="col-span-2 py-10 text-center text-slate-400 dark:text-slate-600 font-medium border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                    No projects yet — click + to add one
                  </div>
                )}
                {projects.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="group relative flex items-center gap-5 p-5 rounded-[24px] border border-slate-50 dark:border-white/5 bg-white dark:bg-white/2 hover:shadow-xl hover:shadow-indigo-500/5 transition-all hover:-translate-y-1 text-left"
                    >
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:rotate-6 transition-transform", p.color || "bg-indigo-500")}>
                        {(p.name || "P")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
                          {tasks.filter(t => !t.isCompleted && t.projectId === p.id).length} tasks remaining
                        </p>
                      </div>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1.5 rounded-xl text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Private Notepad Card */}
            <div className="p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col min-h-[450px]">
              <SectionHeader title="Private Notepad" />
              
              <div className="flex-1 border-t border-dashed border-slate-100 dark:border-white/10 pt-6">
                <textarea 
                  placeholder="Write down anything here..."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed custom-scrollbar font-medium"
                />
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"><Bold className="h-4 w-4" /></button>
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"><Italic className="h-4 w-4" /></button>
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"><Underline className="h-4 w-4" /></button>
                  <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-1" />
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"><List className="h-4 w-4" /></button>
                  <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"><ListOrdered className="h-4 w-4" /></button>
                </div>
                <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                  Auto-saved
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
