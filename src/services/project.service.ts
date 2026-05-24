import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const projectService = {
  async getProjects(workspaceId: string) {
    const { data, error } = await (supabase
      .from('projects') as any)
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addProject(project: { name: string; color: string; workspace_id: string }) {
    const { data, error } = await (supabase
      .from('projects') as any)
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(id: string) {
    const { error } = await (supabase
      .from('projects') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
