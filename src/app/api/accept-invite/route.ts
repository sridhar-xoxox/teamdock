import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side route: accepts a workspace invitation using the service role key
// This bypasses all RLS policies for the critical insert + delete operations
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inviteId, userId } = body as { inviteId: string; userId: string };

    if (!inviteId || !userId) {
      return NextResponse.json({ error: 'inviteId and userId are required' }, { status: 400 });
    }

    // Fetch the invitation (service role can always read this)
    const { data: invite, error: ie } = await admin
      .from('invitations')
      .select('id, workspace_id, email, role, workspaces(id, name)')
      .eq('id', inviteId)
      .single();

    if (ie || !invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify the authenticated user's email matches the invitation
    const { data: { user }, error: ue } = await admin.auth.admin.getUserById(userId);
    if (ue || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: `This invitation is for ${invite.email}, not ${user.email}` },
        { status: 403 }
      );
    }

    // Ensure profile exists (trigger may not have run yet if just signed up)
    await admin.from('profiles').upsert(
      { id: userId, email: user.email!, full_name: user.user_metadata?.full_name || null },
      { onConflict: 'id' }
    );

    // Add user to workspace_members (bypassing RLS via service role)
    const role = (invite.role as string).toLowerCase();
    const { error: me } = await admin
      .from('workspace_members')
      .upsert(
        { workspace_id: invite.workspace_id, user_id: userId, role },
        { onConflict: 'workspace_id,user_id' }
      );

    if (me) {
      return NextResponse.json({ error: `Failed to join workspace: ${me.message}` }, { status: 500 });
    }

    // Delete the consumed invitation
    await admin.from('invitations').delete().eq('id', inviteId);

    const ws = invite.workspaces as any;
    return NextResponse.json({
      success: true,
      workspace: ws ? { id: ws.id, name: ws.name } : null,
    });

  } catch (err: any) {
    console.error('[accept-invite] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
