"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { taskService } from "@/services/task.service";
import { workspaceService } from "@/services/workspace.service";
import { invitationService } from "@/services/invitation.service";
import { projectService } from "@/services/project.service";

export const getAvatarColor = (initials: string) => {
  const colors = [
    '#f97316', // Orange
    '#10b981', // Emerald
    '#db2777', // Pink
    '#7c3aed', // Violet
    '#0d9488', // Teal
    '#ea580c', // Dark Orange
    '#e11d48', // Rose
    '#2563eb'  // Blue
  ];
  const charCode = (initials && initials.charCodeAt(0)) || 0;
  return colors[charCode % colors.length];
};

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Workspace {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt: string;
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
  projectId?: string;
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
  id?: string;
  workspace_id?: string;
}

interface Ctx {
  workspaces: Workspace[];
  tasks: Task[];
  members: Member[];
  invites: Invite[];
  sessions: Member[];
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
  switchSession: (id: string) => void;
  logoutSession: (id: string) => Promise<void>;

  createWorkspace: (name: string, adminMember: Omit<Member, "workspaceId">) => Promise<void>;
  joinWorkspace: (invite: Invite, member: Omit<Member, "workspaceId">) => Promise<void>;

  addInvite: (email: string, role: string) => void;
  removeInvite: (email: string) => void;
  addTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt" | "workspaceId"> & { workspaceId?: string, projectId?: string }) => Promise<void>;
  updateTask: (id: string, u: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, s: TaskStatus) => Promise<void>;

  projects: Project[];
  addProject: (name: string, color?: string) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<void>;

  theme: "light" | "dark";
  toggleTheme: () => void;

  activeWorkspace: Workspace | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  getInviteByEmail: (email: string) => Invite | undefined;
  updateMemberRole: (id: string, role: string) => void;
  addTaskComment: (taskId: string, memberId: string, text: string) => void;
  allTasks: Task[];
  allMembers: Member[];
  loading: boolean;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allInvites, setAllInvites] = useState<Invite[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const [sessions, setSessions] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Auth and Sync Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();

        if (user) {
          // 1. Fetch profile — upsert as fallback so we never get stuck
          let profile: any = null;
          try {
            profile = await authService.getProfile(user.id);
            if (!profile) {
              profile = await authService.ensureProfile(
                user.id,
                user.email ?? '',
                user.user_metadata?.full_name ?? user.email ?? 'User'
              );
            }
          } catch (pe) {
            console.error('Profile fetch error:', pe);
          }

          if (!profile) {
            // Truly broken state — but let's try to proceed with minimal info
            profile = { id: user.id, email: user.email, full_name: user.email?.split('@')[0] || 'User' };
          }

          // 2. Fetch Workspaces
          let userWorkspaces: any[] = [];
          try {
            userWorkspaces = await workspaceService.getWorkspaces(user.id);
            setWorkspaces(userWorkspaces);
          } catch (we) {
            console.error('Workspace fetch error:', we);
          }

          const hasWorkspaces = userWorkspaces.length > 0;
          const firstWs = hasWorkspaces ? userWorkspaces[0] : null;
          const firstWsId = firstWs?.id || '';

          if (hasWorkspaces) {
            // 3. Fetch Tasks (Resilient)
            try {
              const tasksData = await taskService.getTasks(firstWsId);
              setAllTasks((tasksData as any[]).map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                priority: t.priority as Priority,
                status: t.status as TaskStatus,
                isCompleted: t.status === 'DONE',
                dueDate: t.due_date || undefined,
                assigneeId: t.assigned_to || undefined,
                tags: [],
                workspaceId: t.workspace_id,
                projectId: t.project_id || undefined,
                createdAt: t.created_at,
                updatedAt: t.created_at,
                attachments: t.attachments || []
              })));
            } catch (te) {
              console.error('Tasks fetch error:', te);
            }

            // 3.5 Fetch Projects (Resilient)
            try {
              const projectsData = await projectService.getProjects(firstWsId);
              setAllProjects((projectsData as any[]).map((p: any) => ({
                id: p.id,
                name: p.name,
                color: p.color,
                workspaceId: p.workspace_id,
                createdAt: p.created_at
              })));
            } catch (pe) {
              console.error('Projects fetch error:', pe);
            }

            // 4. Fetch Members (Resilient)
            let mappedMembers: Member[] = [];
            try {
              const membersData = await workspaceService.getMembers(firstWsId);
              mappedMembers = (membersData as any[]).map((m: any) => {
                const initials = (m.profiles?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase();
                return {
                  id: m.user_id,
                  name: m.profiles?.full_name || 'Unknown',
                  email: m.profiles?.email || '',
                  initials,
                  role: (m.role.charAt(0).toUpperCase() + m.role.slice(1)) as 'Admin' | 'Manager' | 'Member',
                  color: getAvatarColor(initials),
                  workspaceId: m.workspace_id
                };
              });
              setAllMembers(mappedMembers);
            } catch (me) {
              console.error('Members fetch error:', me);
            }

            // 5. Fetch Invites (Resilient)
            try {
              const invitesData = await invitationService.getInvites(firstWsId);
              setAllInvites(invitesData.map((i: any) => ({
                email: i.email,
                role: i.role.charAt(0).toUpperCase() + i.role.slice(1),
                workspaceId: i.workspace_id,
                id: i.id
              })));
            } catch (ie) {
              console.error('Invites fetch error:', ie);
            }

            // 6. Set Current User
            const currentMember = mappedMembers.find(m => m.id === user.id);
            if (currentMember) {
              setCurrentUser(currentMember);
              setSessions([currentMember]);
            } else {
              const fallbackName = profile?.full_name || user.email || 'User';
              const fallbackEmail = profile?.email || user.email || '';
              const initials = fallbackName.split(' ').map((n: string) => (n?.[0] || '')).join('').toUpperCase();
              const fallbackMember: Member = {
                id: user.id,
                name: fallbackName,
                email: fallbackEmail,
                initials,
                role: (firstWs as any)?.role || 'admin',
                color: getAvatarColor(initials),
                workspaceId: firstWsId
              };
              setCurrentUser(fallbackMember);
              setSessions([fallbackMember]);
            }
          } else {
            // No workspace — build a user object from profile so dashboard renders
            const fallbackName = profile?.full_name || user.email || 'User';
            const fallbackEmail = profile?.email || user.email || '';
            const initials = fallbackName.split(' ').map((n: string) => (n?.[0] || '')).join('').toUpperCase();
            const fallbackMember: Member = {
              id: user.id,
              name: fallbackName,
              email: fallbackEmail,
              initials,
              role: 'admin',
              color: getAvatarColor(initials),
              workspaceId: ''
            };
            setCurrentUser(fallbackMember);
            setSessions([fallbackMember]);
          }
        }

        // Theme
        const savedTheme = localStorage.getItem('qt_theme') as 'light' | 'dark' | null;
        if (savedTheme) setTheme(savedTheme);
        else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      } catch (e) {
        console.error('Global Store init error:', e);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };
    init();
  }, []);


  // Apply Theme to DOM
  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("qt_theme", theme);
  }, [theme, mounted]);

  const handleSetCurrentUser = (user: Member | null) => {
    setCurrentUser(user);
    if (user) {
      setSessions(prev => prev.find(s => s.id === user.id) ? prev : [...prev, user]);
    }
  };

  const switchSession = (id: string) => {
    const user = sessions.find(s => s.id === id);
    if (user) setCurrentUser(user);
  };

  const logoutSession = async (id: string) => {
    try {
      await authService.signOut();
    } catch (se) {
      console.error("Supabase signOut error:", se);
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    // Hard refresh clear redirect
    window.location.href = "/login";
  };

  const createWorkspace = async (name: string, adminMember: Omit<Member, "workspaceId">) => {
    if (!currentUser) return;
    try {
      const workspace = await workspaceService.createWorkspace(name, currentUser.id) as any;
      setWorkspaces(p => [...p, workspace]);
      const newMember = { ...adminMember, workspaceId: workspace.id };
      setAllMembers(p => [...p, newMember]);
      handleSetCurrentUser(newMember);
    } catch (e) {
      console.error("Create Workspace Error", e);
    }
  };

  const joinWorkspace = async (invite: Invite, member: Omit<Member, "workspaceId">) => {
    const wsId = invite.workspaceId || invite.workspace_id;
    if (!wsId) throw new Error("workspaceId is required");

    let inviteId = invite.id;
    if (!inviteId) {
      // Fetch invite id if missing
      const pending = await invitationService.getPendingInvite(invite.email);
      if (pending) {
        inviteId = pending.id;
      }
    }

    if (inviteId) {
      await invitationService.acceptInvite(
        inviteId, 
        wsId, 
        member.id, 
        invite.role.toLowerCase(), 
        invite.email
      );
    }
    
    const newMember = { ...member, workspaceId: wsId, role: invite.role };
    setAllMembers(p => [...p, newMember]);
    setAllInvites(p => p.filter(i => i.email !== invite.email));
    handleSetCurrentUser(newMember);
  };

  const currentWorkspaceId = currentUser?.workspaceId;
  const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  const tasks = allTasks.filter(t => t.workspaceId === currentWorkspaceId);
  const members = allMembers.filter(m => m.workspaceId === currentWorkspaceId);
  const invites = allInvites.filter(i => i.workspaceId === currentWorkspaceId);
  const projects = allProjects.filter(p => p.workspaceId === currentWorkspaceId);

  const addInvite = async (email: string, role: string) => {
    if (!currentWorkspaceId || !currentUser) return;
    try {
      const inv = await invitationService.createInvite(currentWorkspaceId, email, role, currentUser.id);
      setAllInvites(p => [
        ...p.filter(i => !(i.email === email && i.workspaceId === currentWorkspaceId)),
        { email: inv.email, role: inv.role, workspaceId: inv.workspace_id, id: inv.id }
      ]);
    } catch (e: any) {
      console.error('Add invite error:', e.message);
    }
  };

  const removeInvite = async (email: string) => {
    if (!currentWorkspaceId) return;
    try {
      await invitationService.deleteInvite(currentWorkspaceId, email);
      setAllInvites(p => p.filter(i => !(i.email === email && i.workspaceId === currentWorkspaceId)));
    } catch (e: any) {
      console.error('Remove invite error:', e.message);
      // Still remove from local state
      setAllInvites(p => p.filter(i => !(i.email === email && i.workspaceId === currentWorkspaceId)));
    }
  };

  const addTask = async (t: Omit<Task, "id" | "createdAt" | "updatedAt" | "workspaceId"> & { workspaceId?: string, projectId?: string }) => {
    const targetWsId = t.workspaceId || currentWorkspaceId;
    if (!targetWsId || !currentUser) return;

    try {
      const newTask = await taskService.addTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        workspace_id: targetWsId,
        assigned_to: t.assigneeId || null,
        created_by: currentUser.id,
        due_date: t.dueDate || null,
        attachments: t.attachments || null,
        project_id: t.projectId || null
      } as any) as any;

      const mappedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority as Priority,
        status: newTask.status as TaskStatus,
        isCompleted: newTask.status === "DONE",
        dueDate: newTask.due_date || undefined,
        assigneeId: newTask.assigned_to || undefined,
        tags: [],
        workspaceId: newTask.workspace_id,
        projectId: newTask.project_id || undefined,
        createdAt: newTask.created_at,
        updatedAt: newTask.created_at,
        attachments: newTask.attachments || []
      };

      setAllTasks(p => [mappedTask, ...p]);
    } catch (e) {
      console.error("Add Task Error", e);
    }
  };

  const updateTask = async (id: string, u: Partial<Task>) => {
    try {
      const updates: any = {};
      if (u.title !== undefined) updates.title = u.title;
      if (u.description !== undefined) updates.description = u.description;
      if (u.priority !== undefined) updates.priority = u.priority;
      if (u.status !== undefined) updates.status = u.status;
      if (u.dueDate !== undefined) updates.due_date = u.dueDate;
      if (u.assigneeId !== undefined) updates.assigned_to = u.assigneeId;
      if (u.isCompleted !== undefined) updates.status = u.isCompleted ? "DONE" : "TODO";
      if (u.projectId !== undefined) updates.project_id = u.projectId || null;

      await taskService.updateTask(id, updates);
      setAllTasks(p => p.map(t => t.id === id ? { ...t, ...u, updatedAt: new Date().toISOString() } : t));
    } catch (e) {
      console.error("Update Task Error", e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setAllTasks(p => p.filter(t => t.id !== id));
    } catch (e) {
      console.error("Delete Task Error", e);
    }
  };

  const moveTask = async (id: string, s: TaskStatus) => {
    try {
      await taskService.updateTask(id, { status: s });
      setAllTasks(p => p.map(t => t.id === id ? { ...t, status: s, isCompleted: s === "DONE", updatedAt: new Date().toISOString() } : t));
    } catch (e) {
      console.error("Move Task Error", e);
    }
  };

  const addProject = async (name: string, color?: string) => {
    if (!currentWorkspaceId) return;
    try {
      const colorVal = color || ["bg-black dark:bg-white text-white dark:text-black", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-violet-500", "bg-cyan-500", "bg-amber-500", "bg-rose-500"][Math.floor(Math.random() * 8)];
      const proj = await projectService.addProject({
        name,
        color: colorVal,
        workspace_id: currentWorkspaceId
      });
      const mapped: Project = {
        id: proj.id,
        name: proj.name,
        color: proj.color,
        workspaceId: proj.workspace_id,
        createdAt: proj.created_at
      };
      setAllProjects(prev => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("Add Project Error", e);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setAllProjects(p => p.filter(proj => proj.id !== id));
    } catch (e) {
      console.error("Delete Project Error", e);
    }
  };

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const getMemberByEmail = (email: string) => allMembers.find(m => m.email === email);
  const getInviteByEmail = (email: string) => allInvites.find(i => i.email === email);

  const updateMemberRole = (id: string, role: string) => {
    setAllMembers(p => p.map(m => m.id === id ? { ...m, role } : m));
    if (currentUser?.id === id) setCurrentUser(p => p ? { ...p, role } : null);
    setSessions(p => p.map(s => s.id === id ? { ...s, role } : s));
  };

  const addTaskComment = (taskId: string, memberId: string, text: string) => {
    const newComment: TaskComment = {
      id: `c${Date.now()}`,
      taskId,
      memberId,
      text,
      createdAt: new Date().toISOString()
    };
    setAllTasks(p => p.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t));
  };

  return (
    <StoreCtx.Provider value={{
      workspaces, tasks, members, invites, sessions, currentUser, setCurrentUser: handleSetCurrentUser,
      switchSession, logoutSession, activeWorkspace,
      createWorkspace, joinWorkspace,
      addInvite, removeInvite,
      addTask, updateTask, deleteTask, moveTask,
      projects, addProject, deleteProject,
      theme, toggleTheme,
      getMemberByEmail, getInviteByEmail, updateMemberRole, addTaskComment,
      allTasks, allMembers, loading
    }}> {children} </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
