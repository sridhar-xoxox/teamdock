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

  // Check if an email has a pending invite — uses server-side API route with service role
  // so workspace names are visible even to unauthenticated users
  async getPendingInvite(email: string) {
    try {
      const res = await fetch(
        `/api/invite-lookup?email=${encodeURIComponent(email.toLowerCase())}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        return data; // already shaped correctly by the API route
      }
    } catch (_) {
      // fall through
    }
    // Fallback: direct table read (may lack workspace name if anon)
    const { data } = await supabase
      .from('invitations')
      .select('id, workspace_id, email, role, token')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    return data ? { ...data, workspaces: null } : null;
  },

  // Accept invite — uses server-side API route with service role to bypass RLS
  async acceptInvite(inviteId: string, _workspaceId: string, userId: string, _role: string) {
    const res = await fetch('/api/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to accept invitation');
    return data;
  }
};
