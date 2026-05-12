import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const workspaceService = {
  async createWorkspace(name: string, userId: string) {
    // 1. Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: userId })
      .select()
      .single();
    
    if (wsError) throw wsError;

    // 2. Add creator as admin member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'admin'
      });
    
    if (memberError) throw memberError;

    return workspace;
  },

  async getWorkspaces(userId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace:workspaces(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(d => d.workspace);
  },

  async getMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*, profile:profiles(*)')
      .eq('workspace_id', workspaceId);
    
    if (error) throw error;
    return data;
  }
};
