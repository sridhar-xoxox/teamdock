import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

const supabase = createClient();

export type Task = Database['public']['Tables']['tasks']['Row'];
export type NewTask = Database['public']['Tables']['tasks']['Insert'];

export const taskService = {
  async getTasks(workspaceId: string) {
    const response = await fetch(`/api/tasks?workspaceId=${encodeURIComponent(workspaceId)}`);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to fetch tasks: ${response.status}`);
    }
    const { tasks } = await response.json();
    return tasks;
  },

  async addTask(task: NewTask) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId: task.workspace_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        assigned_to: task.assigned_to
      }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to add task: ${response.status}`);
    }
    return await response.json();
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to update task: ${response.status}`);
    }
    return await response.json();
  },

  async deleteTask(id: string) {
    const response = await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to delete task: ${response.status}`);
    }
  },

  async subscribeToTasks(workspaceId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        callback
      )
      .subscribe();
  }
};
