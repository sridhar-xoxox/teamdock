export const invitationService = {
  // Save invite to Supabase
  async createInvite(workspaceId: string, email: string, role: string, invitedBy: string) {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, email, role }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to create invite: ${response.status}`);
    }
    return await response.json();
  },

  // Fetch all invites for a workspace
  async getInvites(workspaceId: string) {
    const response = await fetch(`/api/invitations?workspaceId=${encodeURIComponent(workspaceId)}`);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to fetch invites: ${response.status}`);
    }
    const { invites } = await response.json();
    return invites || [];
  },

  // Delete an invite
  async deleteInvite(workspaceId: string, email: string) {
    const response = await fetch(`/api/invitations?workspaceId=${encodeURIComponent(workspaceId)}&email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to delete invite: ${response.status}`);
    }
  },

  // Check if an email has a pending invite (called during signup)
  async getPendingInvite(email: string) {
    try {
      const response = await fetch(`/api/check-invite?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const { invite } = await response.json();
        return invite;
      }
    } catch (e) {
      console.error('getPendingInvite fetch error:', e);
    }
    return null;
  },

  // Accept invite: add user to workspace_members and delete the invite
  async acceptInvite(inviteId: string, workspaceId: string, userId: string, role: string, email: string) {
    const response = await fetch('/api/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, workspaceId, role, userId, userEmail: email }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to accept invite: ${response.status}`);
    }
    return true;
  }
};
