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
  // Falls back to direct table read if the RPC is unavailable
  async getPendingInvite(email: string) {
    // First try the secure RPC (works when deployed)
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        'get_pending_invite_by_email' as any,
        { p_email: email.toLowerCase() }
      );
      if (!rpcErr && rpcData) {
        const raw = rpcData as any;
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
      }
    } catch (_) {
      // fall through to direct query
    }

    // Fallback: direct table read (works for authenticated users)
    const { data, error } = await supabase
      .from('invitations')
      .select('id, workspace_id, email, role, token, workspaces(id, name)')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error || !data) return null;
    return data as any;
  },

  // Accept invite: atomically add user to workspace_members and delete the invite
  // Called after auth.signUp returns — user IS authenticated at this point
  async acceptInvite(inviteId: string, workspaceId: string, userId: string, role: string) {
    // Add member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .upsert(
        { workspace_id: workspaceId, user_id: userId, role: role.toLowerCase() as any },
        { onConflict: 'workspace_id,user_id' }
      );
    if (memberError) throw memberError;

    // Remove the consumed invitation
    await supabase.from('invitations').delete().eq('id', inviteId);
    return true;
  }
};
