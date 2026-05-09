"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Workspace {
  id: string;
  name: string;
}

export interface Task {
  id: string; title: string; description?: string;
  priority: Priority; status: TaskStatus; isCompleted: boolean;
  dueDate?: string; assigneeId?: string; tags: string[];
  createdAt: string; updatedAt: string;
  workspaceId: string;
}

export interface TeamMember {
  id: string; name: string; initials: string;
  email: string; role: string; color: string;
  workspaceId: string;
}

export interface Invite {
  email: string;
  role: string;
  workspaceId: string;
}

interface Ctx {
  workspaces: Workspace[];
  tasks: Task[]; 
  members: TeamMember[];
  invites: Invite[];
  sessions: TeamMember[];
  currentUser: TeamMember | null;
  setCurrentUser: (user: TeamMember | null) => void;
  switchSession: (id: string) => void;
  logoutSession: (id: string) => void;
  
  createWorkspace: (name: string, adminMember: Omit<TeamMember, "workspaceId">) => void;
  joinWorkspace: (invite: Invite, member: Omit<TeamMember, "workspaceId">) => void;
  
  addInvite: (email: string, role: string) => void;
  removeInvite: (email: string) => void;
  addTask: (t: Omit<Task,"id"|"createdAt"|"updatedAt"|"workspaceId">) => void;
  updateTask: (id: string, u: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, s: TaskStatus) => void;
  
  theme: "light" | "dark";
  toggleTheme: () => void;
  
  activeWorkspace: Workspace | undefined;
  getMemberByEmail: (email: string) => TeamMember | undefined;
  getInviteByEmail: (email: string) => Invite | undefined;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
// ... existing state definitions ...
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [allInvites, setAllInvites] = useState<Invite[]>([]);
  
  const [sessions, setSessions] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const w = localStorage.getItem("qt_workspaces");
      if (w) setWorkspaces(JSON.parse(w));

      const s = localStorage.getItem("qt_tasks");
      if (s) setAllTasks(JSON.parse(s));
      
      const m = localStorage.getItem("qt_members");
      if (m) setAllMembers(JSON.parse(m));
      
      const i = localStorage.getItem("qt_invites");
      if (i) setAllInvites(JSON.parse(i));

      const sess = localStorage.getItem("qt_sessions");
      if (sess) setSessions(JSON.parse(sess));

      const u = localStorage.getItem("qt_user");
      if (u) setCurrentUser(JSON.parse(u));

      const t = localStorage.getItem("qt_theme") as "light" | "dark";
      if (t) {
        setTheme(t);
      } else {
        // Default to system theme if no preference is saved
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemTheme);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Automatically update theme when system preference changes
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("qt_theme", theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("qt_workspaces", JSON.stringify(workspaces));
      localStorage.setItem("qt_tasks", JSON.stringify(allTasks));
      localStorage.setItem("qt_members", JSON.stringify(allMembers));
      localStorage.setItem("qt_invites", JSON.stringify(allInvites));
      localStorage.setItem("qt_sessions", JSON.stringify(sessions));
      if (currentUser) {
        localStorage.setItem("qt_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("qt_user");
      }
    }
  }, [workspaces, allTasks, allMembers, allInvites, sessions, currentUser, mounted]);

  const handleSetCurrentUser = (user: TeamMember | null) => {
    setCurrentUser(user);
    if (user) {
      setSessions(prev => {
        if (!prev.find(s => s.id === user.id)) {
          return [...prev, user];
        }
        return prev;
      });
    }
  };

  const switchSession = (id: string) => {
    const user = sessions.find(s => s.id === id);
    if (user) setCurrentUser(user);
  };

  const logoutSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentUser?.id === id) {
      setCurrentUser(newSessions.length > 0 ? newSessions[0] : null);
    }
  };

  const createWorkspace = (name: string, adminMember: Omit<TeamMember, "workspaceId">) => {
    const workspaceId = `ws_${Date.now()}`;
    setWorkspaces(p => [...p, { id: workspaceId, name }]);
    const newMember = { ...adminMember, workspaceId };
    setAllMembers(p => [...p, newMember]);
    handleSetCurrentUser(newMember);
  };

  const joinWorkspace = (invite: Invite, member: Omit<TeamMember, "workspaceId">) => {
    const newMember = { ...member, workspaceId: invite.workspaceId, role: invite.role };
    setAllMembers(p => [...p, newMember]);
    setAllInvites(p => p.filter(i => i.email !== invite.email));
    handleSetCurrentUser(newMember);
  };

  const currentWorkspaceId = currentUser?.workspaceId;
  const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  const tasks = allTasks.filter(t => t.workspaceId === currentWorkspaceId);
  const members = allMembers.filter(m => m.workspaceId === currentWorkspaceId);
  const invites = allInvites.filter(i => i.workspaceId === currentWorkspaceId);

  const addInvite = (email: string, role: string) => {
    if (!currentWorkspaceId) return;
    setAllInvites(p => [...p, { email, role, workspaceId: currentWorkspaceId }]);
  };
  
  const removeInvite = (email: string) => {
    if (!currentWorkspaceId) return;
    setAllInvites(p => p.filter(i => !(i.email === email && i.workspaceId === currentWorkspaceId)));
  };

  const addTask = (t: Omit<Task,"id"|"createdAt"|"updatedAt"|"workspaceId">) => {
    if (!currentWorkspaceId) return;
    setAllTasks(p => [{ ...t, id:`t${Date.now()}`, workspaceId: currentWorkspaceId, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }, ...p]);
  };

  const updateTask = (id: string, u: Partial<Task>) =>
    setAllTasks(p => p.map(t => t.id===id ? { ...t, ...u, updatedAt:new Date().toISOString() } : t));

  const deleteTask = (id: string) => setAllTasks(p => p.filter(t => t.id !== id));

  const moveTask = (id: string, s: TaskStatus) =>
    setAllTasks(p => p.map(t => t.id===id ? { ...t, status:s, isCompleted:s==="DONE", updatedAt:new Date().toISOString() } : t));

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const getMemberByEmail = (email: string) => allMembers.find(m => m.email === email);
  const getInviteByEmail = (email: string) => allInvites.find(i => i.email === email);

  if (!mounted) {
    return null;
  }

  return (
    <StoreCtx.Provider value={{ 
      workspaces, tasks, members, invites, sessions, currentUser, setCurrentUser: handleSetCurrentUser, 
      switchSession, logoutSession, activeWorkspace,
      createWorkspace, joinWorkspace,
      addInvite, removeInvite,
      addTask, updateTask, deleteTask, moveTask,
      theme, toggleTheme,
      getMemberByEmail, getInviteByEmail
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
