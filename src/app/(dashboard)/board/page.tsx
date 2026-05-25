"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, Settings, TrendingUp, TrendingDown, Eye, Plus, 
  MoreVertical, MoreHorizontal, Filter, Bold, Italic, Underline, 
  Strikethrough, List, ListOrdered, ChevronDown, Bell, Grid, User,
  Calendar, Trash2, FolderKanban, AlertCircle, CheckCircle2
} from "lucide-react";
import { useStore, Task, Member, Workspace, Project } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  <div className="flex-1 min-w-[140px] md:min-w-[180px] p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={cn("flex items-center gap-0.5 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full", 
        trend === "up" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-orange-600 bg-orange-50 dark:bg-orange-500/10")}>
        {trend === "up" ? <TrendingUp className="h-2.5 md:h-3 w-2.5 md:w-3" /> : <TrendingDown className="h-2.5 md:h-3 w-2.5 md:w-3" />}
        {trendValue}
      </div>
    </div>
    <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">
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
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notepadRef = useRef<HTMLTextAreaElement>(null);
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
  const [projectError, setProjectError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState("");

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notepad formatting helper
  const formatText = useCallback((type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'ul' | 'ol') => {
    const ta = notepadRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = notepadContent.substring(start, end);
    const before = notepadContent.substring(0, start);
    const after = notepadContent.substring(end);

    let replacement = selected;
    let cursorOffset = 0;

    if (type === 'bold') {
      replacement = `**${selected}**`;
      cursorOffset = selected ? 0 : 2;
    } else if (type === 'italic') {
      replacement = `_${selected}_`;
      cursorOffset = selected ? 0 : 1;
    } else if (type === 'underline') {
      replacement = `__${selected}__`;
      cursorOffset = selected ? 0 : 2;
    } else if (type === 'strikethrough') {
      replacement = `~~${selected}~~`;
      cursorOffset = selected ? 0 : 2;
    } else if (type === 'ul') {
      const lines = (selected || 'Item').split('\n');
      replacement = lines.map(l => `• ${l}`).join('\n');
    } else if (type === 'ol') {
      const lines = (selected || 'Item').split('\n');
      replacement = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
    }

    const newContent = before + replacement + after;
    setNotepadContent(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = start + replacement.length - cursorOffset;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [notepadContent]);

  // Project add handler with error handling
  const handleAddProject = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjectError("");
    setProjectSuccess("");
    try {
      await addProject(trimmed);
      setProjectSuccess(`"${trimmed}" added!`);
      setAddingProject(false);
      setNewProjectName("");
      setTimeout(() => setProjectSuccess(""), 3000);
    } catch (e: any) {
      setProjectError(e?.message || "Failed to add project. Check your permissions.");
    }
  };

  if (!mounted) return null;

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const isMember = currentUser?.role?.toLowerCase() === "member";
  const isManager = currentUser?.role?.toLowerCase() === "manager";
  const canCreateProject = isAdmin || isManager;

  // Calculated stats
  const realProjectsCount = projects.length;
  const realTasksCount = tasks.length;
  const realAssignedCount = tasks.filter(t => t.assigneeId === currentUser?.id).length;
  const realCompletedCount = tasks.filter(t => t.isCompleted).length;
  const realOverdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted).length;

  // Workspace Name Resolver
  const getWorkspaceName = (id: string) => workspaces.find(w => w.id === id)?.name || id;

  // Filter Data based on Search
  const searchLower = search.toLowerCase();
  
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchLower) ||
    getWorkspaceName(t.workspaceId).toLowerCase().includes(searchLower)
  );

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchLower)
  );

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchLower) ||
    m.email.toLowerCase().includes(searchLower)
  );

  const assignedToMe = filteredTasks.filter(t => t.assigneeId === currentUser?.id);
  const displayTasks = isMember 
    ? assignedToMe.slice(0, 5) 
    : (assignedToMe.length > 0 ? assignedToMe.slice(0, 5) : filteredTasks.slice(0, 3));
  
  const displayPeople = filteredMembers.length > 0 ? filteredMembers : (
    search === "" 
      ? [{ id: "m1", name: "Marc Atenson", email: "marcnine@gmail.com", color: "bg-indigo-100", initials: "MA" }] 
      : []
  );

  return (
    <div className="flex-1 w-full bg-transparent pb-10">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/40 dark:bg-[#0d1117]/40 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 mb-4 md:mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">Home</h1>
            <p className="hidden xs:block text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide truncate">Monitor all your projects and tasks</p>
          </div>
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
            <div className="hidden md:flex relative w-64 lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search anything..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-12 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-[#1a1f2e] focus:outline-none transition-all text-sm text-slate-900 dark:text-white shadow-inner"
              />
            </div>
            <button 
              onClick={() => router.push("/settings")}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 shadow-sm hover:shadow transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="px-4 md:px-8 space-y-6 md:space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:flex gap-4 md:gap-6">
          <StatCard title="Total Projects" value={realProjectsCount || 0} trend="up" trendValue={2} color="text-indigo-600" />
          <StatCard title="Total Tasks" value={tasks.length} trend="up" trendValue={4} color="text-emerald-600" />
          <StatCard title="Active Members" value={members.length} trend="up" trendValue={1} color="text-amber-600" />
          <StatCard title="Completed" value={realCompletedCount || 0} trend="up" trendValue={1} color="text-emerald-500" />
          <div className="col-span-2 lg:flex-1">
            <StatCard title="Overdue" value={realOverdueCount || 0} trend="up" trendValue={2} color="text-red-500" />
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          
          {/* Left Column (Assigned Tasks & People) */}
          <div className="col-span-12 lg:col-span-6 space-y-10">
            
            {/* Assigned Tasks Card - Hidden on Mobile */}
            <div className="hidden md:block p-5 md:p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="Assigned Tasks">
                <div className="flex items-center gap-3">
                  <div className="hidden xs:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
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
                  <div className="py-8 md:py-12 text-center text-slate-400 dark:text-slate-600 font-medium border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                    No tasks assigned to you yet
                  </div>
                )}
              </div>
              
              <Link href="/my-tasks" className="block w-full mt-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20">
                Show All Tasks
              </Link>
            </div>

            {/* People Section Card - Hidden on Mobile */}
            <div className="hidden md:block p-5 md:p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="People" count={displayPeople.length}>
                <button
                  onClick={() => router.push('/team')}
                  title="Invite a team member"
                  className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </SectionHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {displayPeople.map((m: any) => (
                  <div key={m.id} className="group p-5 rounded-3xl border border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:border-indigo-500/20 transition-all text-center">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-lg shadow-inner apple-bubble",
                        !m.color?.startsWith('#') && (m.color || "bg-slate-100 dark:bg-white/5"),
                        m.color?.startsWith('#') ? "text-white" : "text-indigo-600 dark:text-indigo-400"
                      )}
                      style={{ backgroundColor: m.color?.startsWith('#') ? m.color : undefined }}
                    >
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
            <div className="p-5 md:p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm">
              <SectionHeader title="Projects" count={filteredProjects.length}>
                {canCreateProject && (
                  <button
                    onClick={() => { setAddingProject(true); setNewProjectName(""); setProjectError(""); setProjectSuccess(""); }}
                    className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                    title="Add project"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </SectionHeader>

              {/* Success / Error feedback */}
              {projectSuccess && (
                <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {projectSuccess}
                </div>
              )}

              {/* Inline add project */}
              {addingProject && (
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newProjectName}
                      onChange={e => { setNewProjectName(e.target.value); setProjectError(""); }}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddProject(newProjectName);
                        if (e.key === "Escape") { setAddingProject(false); setNewProjectName(""); setProjectError(""); }
                      }}
                      placeholder="Project name..."
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-indigo-500/30 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => handleAddProject(newProjectName)}
                      className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
                    >Add</button>
                    <button
                      onClick={() => { setAddingProject(false); setNewProjectName(""); setProjectError(""); }}
                      className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >Cancel</button>
                  </div>
                  {projectError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {projectError}
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredProjects.length === 0 && !addingProject && (
                  <div className="col-span-2 py-10 text-center text-slate-400 dark:text-slate-600 font-medium border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                    {search ? "No projects match your search" : "No projects yet — click + to add one"}
                  </div>
                )}
                {filteredProjects.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="group relative flex items-center gap-5 p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 text-left"
                    >
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:rotate-6 transition-transform apple-bubble", p.color || "bg-indigo-500")}>
                        {(p.name || "P")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
                          {tasks.filter(t => !t.isCompleted && t.projectId === p.id).length} tasks remaining
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1.5 rounded-xl text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Private Notepad Card */}
            <div className="p-5 md:p-7 rounded-[32px] bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col min-h-[450px]">
              <SectionHeader title="Private Notepad" />
              
              <div className="flex-1 border-t border-dashed border-slate-100 dark:border-white/10 pt-6">
                <textarea 
                  ref={notepadRef}
                  placeholder="Write down anything here..."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed custom-scrollbar font-medium"
                  style={{ minHeight: '280px' }}
                />
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('bold'); }}
                    title="Bold (**text**)"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><Bold className="h-4 w-4" /></button>
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('italic'); }}
                    title="Italic (_text_)"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><Italic className="h-4 w-4" /></button>
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('underline'); }}
                    title="Underline (__text__)"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><Underline className="h-4 w-4" /></button>
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('strikethrough'); }}
                    title="Strikethrough (~~text~~)"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><Strikethrough className="h-4 w-4" /></button>
                  <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-1" />
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('ul'); }}
                    title="Bullet list"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><List className="h-4 w-4" /></button>
                  <button
                    onMouseDown={e => { e.preventDefault(); formatText('ol'); }}
                    title="Numbered list"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
                  ><ListOrdered className="h-4 w-4" /></button>
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
    </div>
  );
}
