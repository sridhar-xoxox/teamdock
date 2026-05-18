import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const workspaceService = {
  async createWorkspace(name: string, userId: string) {
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: userId } as any)
      .select()
      .single();
    if (wsError) throw wsError;

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: (workspace as any).id,
        user_id: userId,
        role: 'admin'
      } as any);
    if (memberError) throw memberError;

    return workspace;
  },

  async getWorkspaces(userId: string) {
    // Use a direct join approach: get workspace_members and join workspaces
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role, workspace_id, workspaces(id, name, owner_id, created_at)')
      .eq('user_id', userId);
    if (error) throw error;

    return (data as any[])?.map(d => {
      // Supabase may return workspaces as array or object depending on version
      const ws = Array.isArray(d.workspaces) ? d.workspaces[0] : d.workspaces;
      return { ...ws, role: d.role };
    }).filter(Boolean) || [];
  },

  async getMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*, profiles(id, full_name, email, avatar_url)')
      .eq('workspace_id', workspaceId);
    if (error) throw error;
    return data || [];
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    const { error } = await (supabase.from('workspace_members') as any)
      .update({ role: role.toLowerCase() })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async removeMember(workspaceId: string, userId: string) {
    // 1. Unassign all tasks assigned to this user in this workspace to satisfy database constraints
    const { error: tasksError } = await (supabase.from('tasks') as any)
      .update({ assigned_to: null })
      .eq('workspace_id', workspaceId)
      .eq('assigned_to', userId);
      
    if (tasksError) {
      console.error("Failed to unassign tasks before member removal:", tasksError);
      throw tasksError;
    }

    // 2. Remove the member
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    if (error) throw error;
  }
};
