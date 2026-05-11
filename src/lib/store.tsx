"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { taskService } from "@/services/task.service";
import { workspaceService } from "@/services/workspace.service";

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
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const init = async () => {
      try {
        // Theme
        const savedTheme = localStorage.getItem("qt_theme") as "light" | "dark" | null;
        if (savedTheme) setTheme(savedTheme);
        else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");

        // User Session
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getProfile(user.id);
          const userWorkspaces = await workspaceService.getWorkspaces(user.id);
          setWorkspaces(userWorkspaces as any);

          if (userWorkspaces.length > 0) {
            const activeWs = userWorkspaces[0];
            const wsMembers = await workspaceService.getMembers(activeWs.id);
            const wsTasks = await taskService.getTasks(activeWs.id);
            
            setTasks(wsTasks as any);
            setMembers(wsMembers.map(m => ({
              id: m.user_id,
              name: m.profile.full_name,
              email: m.profile.email,
              initials: m.profile.full_name?.split(' ').map((n:any) => n[0]).join('') || 'U',
              role: m.role,
              color: '#6366f1',
              workspaceId: m.workspace_id
            })) as any);

            const currentMember = wsMembers.find(m => m.user_id === user.id);
            if (currentMember) {
              setCurrentUser({
                id: user.id,
                name: profile.full_name,
                email: profile.email,
                initials: profile.full_name?.split(' ').map((n:any) => n[0]).join('') || 'U',
                role: currentMember.role,
                color: '#6366f1',
                workspaceId: activeWs.id
              });
            }
          }
        }
      } catch (err) {
        console.error("Init Error", err);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };
    init();
  }, []);

  // 2. Real-time Subscriptions
  useEffect(() => {
    if (!currentUser?.workspaceId) return;

    let taskSub: any;
    const setupRealtime = async () => {
      taskSub = await taskService.subscribeToTasks(currentUser.workspaceId, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new as any, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      });
    };

    setupRealtime();
    return () => { if (taskSub) taskSub.unsubscribe(); };
  }, [currentUser?.workspaceId]);

  // 3. Theme Application
  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("qt_theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const activeWorkspace = workspaces[0]; // For now, handle single workspace

  const createWorkspace = async (name: string) => {
    if (!currentUser) return;
    const ws = await workspaceService.createWorkspace(name, currentUser.id);
    setWorkspaces([ws as any]);
  };

  const addTask = async (t: any) => {
    if (!currentUser?.workspaceId) return;
    await taskService.addTask({
      ...t,
      workspace_id: currentUser.workspaceId,
      created_by: currentUser.id
    });
  };

  const updateTask = async (id: string, u: Partial<Task>) => {
    await taskService.updateTask(id, u as any);
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
  };

  const moveTask = async (id: string, s: TaskStatus) => {
    await taskService.updateTask(id, { status: s, isCompleted: s === "DONE" } as any);
  };

  const updateMemberRole = async (id: string, role: string) => {
    // Implement in workspaceService later
  };

  const addTaskComment = async (taskId: string, text: string) => {
    // Implement in taskService later
  };

  const signOut = async () => {
    await authService.signOut();
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
      signOut
    }}> {children} </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
