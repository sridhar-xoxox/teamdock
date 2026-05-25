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
    const { data, error } = await supabase.from('invitations')
      .select('*, workspaces(id, name)')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) return null;
    return data;
  },

  // Accept invite: add user to workspace_members and delete the invite
  async acceptInvite(inviteId: string, workspaceId: string, userId: string, role: string, email: string) {
    // Add to workspace_members
    const { error: memberError } = await supabase.from('workspace_members')
      .upsert({ 
        workspace_id: workspaceId, 
        user_id: userId, 
        role: role as any 
      }, { onConflict: 'workspace_id,user_id' });
    if (memberError) throw memberError;

    // Delete the invite
    await supabase.from('invitations')
      .delete()
      .eq('id', inviteId);

    return true;
  }
};
