"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Workspace {
  id: string;
  name: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  memberId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string; title: string; description?: string;
  priority: Priority; status: TaskStatus; isCompleted: boolean;
  dueDate?: string; assigneeId?: string; tags: string[];
  createdAt: string; updatedAt: string;
  workspaceId: string;
  comments?: TaskComment[];
  attachments?: string[];
}

export interface Member {
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
  members: Member[];
  invites: Invite[];
  currentUser: Member | null;
  loading: boolean;
  
  createWorkspace: (name: string) => Promise<void>;
  addTask: (t: Omit<Task,"id"|"createdAt"|"updatedAt"|"workspaceId">) => Promise<void>;
  updateTask: (id: string, u: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, s: TaskStatus) => Promise<void>;
  
  theme: "light" | "dark";
  toggleTheme: () => void;
  
  activeWorkspace: Workspace | undefined;
  updateMemberRole: (id: string, role: string) => Promise<void>;
  addTaskComment: (taskId: string, text: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  getInviteByEmail: (email: string) => Invite | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  joinWorkspace: (invite: Invite, member: Member) => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);

// ─────────────────────────────────────────────
// Mock Initial Data
// ─────────────────────────────────────────────
const MOCK_USER: Member = {
  id: "u1",
  name: "John Doe",
  email: "john@example.com",
  initials: "JD",
  role: "Workspace Admin",
  color: "#6366f1",
  workspaceId: "w1"
};

const MOCK_WORKSPACE: Workspace = {
  id: "w1",
  name: "Main Workspace"
};

const MOCK_MEMBERS: Member[] = [
  MOCK_USER,
  { id: "u2", name: "Alice Smith", email: "alice@example.com", initials: "AS", role: "Member", color: "#10b981", workspaceId: "w1" },
  { id: "u3", name: "Bob Jones", email: "bob@example.com", initials: "BJ", role: "Member", color: "#f59e0b", workspaceId: "w1" },
];

const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Design System Update",
    description: "Update the core component library to reflect new branding guidelines.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    isCompleted: false,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assigneeId: "u1",
    tags: ["design", "branding"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspaceId: "w1"
  },
  {
    id: "t2",
    title: "API Integration",
    description: "Connect the frontend with the new authentication service.",
    priority: "MEDIUM",
    status: "TODO",
    isCompleted: false,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    assigneeId: "u2",
    tags: ["eng"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspaceId: "w1"
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([MOCK_WORKSPACE]);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(MOCK_USER);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Theme Persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("qt_theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("qt_theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const activeWorkspace = workspaces[0];

  const createWorkspace = async (name: string) => {
    const newWs = { id: `w_${Date.now()}`, name };
    setWorkspaces([newWs]);
  };

  const addTask = async (t: any) => {
    const newTask: Task = {
      ...t,
      id: `t_${Date.now()}`,
      workspaceId: activeWorkspace?.id || "w1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: t.tags || []
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = async (id: string, u: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...u, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = async (id: string, s: TaskStatus) => {
    updateTask(id, { status: s, isCompleted: s === "DONE" });
  };

  const updateMemberRole = async (id: string, role: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  };

  const addTaskComment = async (taskId: string, text: string) => {
    const newComment: TaskComment = {
      id: `c_${Date.now()}`,
      taskId,
      memberId: currentUser?.id || "u1",
      text,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t));
  };

  const getInviteByEmail = (email: string) => invites.find(i => i.email === email);
  const getMemberByEmail = (email: string) => members.find(m => m.email === email);
  const joinWorkspace = async (invite: Invite, member: Member) => {
    setMembers(prev => [...prev, member]);
    setCurrentUser(member);
  };

  const signOut = async () => {
    setCurrentUser(null);
    window.location.href = "/login";
  };

  return (
    <StoreCtx.Provider value={{ 
      workspaces, tasks, members, invites, currentUser, loading,
      activeWorkspace,
      createWorkspace,
      addTask, updateTask, deleteTask, moveTask,
      theme, toggleTheme,
      updateMemberRole, addTaskComment,
      signOut,
      getInviteByEmail, getMemberByEmail, joinWorkspace
    }}> {children} </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
