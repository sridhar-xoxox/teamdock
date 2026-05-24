import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const workspaceService = {
  async createWorkspace(name: string, userId: string) {
    const { data: workspace, error } = await (supabase.rpc as any)('create_workspace_with_member', {
      p_name: name,
      p_owner_id: userId
    });
    if (error) throw error;
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
    const { error } = await (supabase.rpc as any)('remove_workspace_member', {
      p_workspace_id: workspaceId,
      p_user_id: userId
    });
    if (error) throw error;
  }
};
