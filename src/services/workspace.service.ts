export const workspaceService = {
  async createWorkspace(name: string, userId: string) {
    const response = await fetch('/api/workspace/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId }),
    });
    if (response.ok) {
      return await response.json();
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Workspace creation failed: ${response.status}`);
  },

  async getWorkspaces(userId: string) {
    const response = await fetch('/api/workspaces');
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to fetch workspaces: ${response.status}`);
    }
    const { workspaces } = await response.json();
    return (workspaces as any[])?.map(d => {
      const ws = Array.isArray(d.workspaces) ? d.workspaces[0] : d.workspaces;
      return { ...ws, role: d.role };
    }).filter(Boolean) || [];
  },

  async getMembers(workspaceId: string) {
    const res = await fetch(`/api/members?workspaceId=${encodeURIComponent(workspaceId)}`);
    if (res.ok) {
      const data = await res.json();
      return data.members || [];
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to fetch members: ${res.status}`);
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    const response = await fetch('/api/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, userId, role }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to update member role: ${response.status}`);
    }
  },

  async removeMember(workspaceId: string, userId: string) {
    const response = await fetch(`/api/members?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to remove member: ${response.status}`);
    }
  }
};
