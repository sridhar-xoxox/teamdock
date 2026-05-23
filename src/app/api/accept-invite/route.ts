import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Called right after a new invited user signs up.
// Uses service_role to insert workspace_members and delete the invite atomically.
// We accept the userId + email directly since the auth cookie may not be readable
// server-side immediately after a client-side signUp().
export async function POST(req: NextRequest) {
  try {
    const { inviteId, workspaceId, role, userId, userEmail } = await req.json();

    if (!inviteId || !workspaceId || !role || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields: inviteId, workspaceId, role, userId, userEmail' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured (service role missing)' }, { status: 500 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Verify invite still exists and the email matches
    const { data: invite, error: inviteError } = await admin
      .from('invitations')
      .select('id, workspace_id, email, role')
      .eq('id', inviteId)
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found or already used' }, { status: 404 });
    }

    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Invite email does not match your account' }, { status: 403 });
    }

    // 2. Verify the user actually exists in auth.users (confirms the signUp completed)
    const { data: { user: authUser }, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !authUser) {
      return NextResponse.json({ error: 'User not found — please try again' }, { status: 404 });
    }

    // 3. Upsert a profile if it doesn't exist yet (the trigger may not have run)
    await admin.from('profiles').upsert({
      id: userId,
      email: userEmail.toLowerCase(),
      full_name: authUser.user_metadata?.full_name || userEmail.split('@')[0],
    }, { onConflict: 'id', ignoreDuplicates: true });

    // 4. Add to workspace_members with the role from the invite (ignore client-sent role for security)
    const { error: memberError } = await admin
      .from('workspace_members')
      .upsert({
        workspace_id: workspaceId,
        user_id: userId,
        role: invite.role.toLowerCase(), // use DB invite role, not client claim
      }, { onConflict: 'workspace_id,user_id' });

    if (memberError) {
      return NextResponse.json({ error: `Failed to add to workspace: ${memberError.message}` }, { status: 500 });
    }

    // 5. Delete the invite so it can't be reused
    await admin.from('invitations').delete().eq('id', inviteId);

    // 6. Return the full workspace info for the client to redirect to
    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, name, owner_id')
      .eq('id', workspaceId)
      .single();

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error('[accept-invite] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
