import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const invitationService = {
  // Save invite to Supabase
  async createInvite(workspaceId: string, email: string, role: string, invitedBy: string) {
    const { data, error } = await supabase.from('invitations')
      .upsert({ 
        workspace_id: workspaceId, 
        email: email.toLowerCase(), 
        role: role.toLowerCase() as any, 
        invited_by: invitedBy 
      }, { onConflict: 'workspace_id,email' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Fetch all invites for a workspace
  async getInvites(workspaceId: string) {
    const { data, error } = await supabase.from('invitations')
      .select('*')
      .eq('workspace_id', workspaceId);
    if (error) throw error;
    return data || [];
  },

  // Delete an invite
  async deleteInvite(workspaceId: string, email: string) {
    const { error } = await supabase.from('invitations')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('email', email.toLowerCase());
    if (error) throw error;
  },

  // Check if an email has a pending invite (called during signup)
  async getPendingInvite(email: string) {
    const { data, error } = await supabase.rpc('get_pending_invite_by_email', {
      p_email: email.toLowerCase()
    });
    if (error || !data) return null;
    const raw = data as any;
    return {
      id: raw.id,
      workspace_id: raw.workspace_id,
      email: raw.email,
      role: raw.role,
      token: raw.token,
      workspaces: {
        id: raw.workspace_id,
        name: raw.workspace_name
      }
    };
  },

  // Accept invite: add user to workspace_members and delete the invite
  async acceptInvite(inviteId: string) {
    const { data, error } = await supabase.rpc('accept_workspace_invite', {
      p_invite_id: inviteId
    });
    if (error) throw error;
    return data;
  }
};
