import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

const supabase = createClient();

export type Task = Database['public']['Tables']['tasks']['Row'];
export type NewTask = Database['public']['Tables']['tasks']['Insert'];

export const taskService = {
  async getTasks(workspaceId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addTask(task: NewTask) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await (supabase
      .from('tasks') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
