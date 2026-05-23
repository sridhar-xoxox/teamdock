import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// GET handler: Fetch all invites for a workspace
export async function GET(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is a member
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: invites, error } = await admin
      .from('invitations')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invites: invites || [] });
  } catch (err: any) {
    console.error('[invitations] GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// POST handler: Create a workspace invitation
export async function POST(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, email, role } = await req.json();
    if (!workspaceId || !email || !role) {
      return NextResponse.json({ error: 'workspaceId, email, and role are required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is an admin or manager in the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember || !['admin', 'manager'].includes(callerMember.role)) {
      return NextResponse.json({ error: 'Permission denied: only admins and managers can invite members' }, { status: 403 });
    }

    const { data: invite, error } = await admin
      .from('invitations')
      .upsert({
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role: role.toLowerCase(),
        invited_by: user.id
      }, { onConflict: 'workspace_id,email' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(invite);
  } catch (err: any) {
    console.error('[invitations] POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE handler: Revoke/delete an invitation
export async function DELETE(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    const email = req.nextUrl.searchParams.get('email');

    if (!workspaceId || !email) {
      return NextResponse.json({ error: 'workspaceId and email are required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is an admin or manager in the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember || !['admin', 'manager'].includes(callerMember.role)) {
      return NextResponse.json({ error: 'Permission denied: only admins and managers can revoke invites' }, { status: 403 });
    }

    const { error } = await admin
      .from('invitations')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('email', email.toLowerCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[invitations] DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
