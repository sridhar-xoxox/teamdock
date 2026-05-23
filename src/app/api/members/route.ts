import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// GET handler: Fetch all members for a workspace
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

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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

    const { data: members, error } = await admin
      .from('workspace_members')
      .select(`
        user_id,
        role,
        workspace_id,
        profiles (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Backfill profiles if needed
    const missingProfiles = (members || []).filter(
      (m: any) => !m.profiles?.full_name || m.profiles.full_name === ''
    );

    if (missingProfiles.length > 0) {
      for (const m of missingProfiles) {
        try {
          const { data: { user: authUser } } = await admin.auth.admin.getUserById(m.user_id);
          if (authUser) {
            const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
            await admin.from('profiles').upsert({
              id: m.user_id,
              email: authUser.email || '',
              full_name: fullName,
            }, { onConflict: 'id' });
            if (m.profiles) {
              (m.profiles as any).full_name = fullName;
              (m.profiles as any).email = authUser.email || '';
            } else {
              (m as any).profiles = { id: m.user_id, full_name: fullName, email: authUser.email || '' };
            }
          }
        } catch (e) {
          console.warn(`Could not backfill profile for ${m.user_id}:`, e);
        }
      }
    }

    return NextResponse.json({ members: members || [] });
  } catch (err: any) {
    console.error('[members] GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// PUT handler: Update member role
export async function PUT(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, userId, role } = await req.json();
    if (!workspaceId || !userId || !role) {
      return NextResponse.json({ error: 'workspaceId, userId, and role are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Permission denied: only admins and managers can change roles' }, { status: 403 });
    }

    const { error } = await admin
      .from('workspace_members')
      .update({ role: role.toLowerCase() })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[members] PUT error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE handler: Remove workspace member
export async function DELETE(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!workspaceId || !userId) {
      return NextResponse.json({ error: 'workspaceId and userId are required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is an admin in the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember || callerMember.role !== 'admin') {
      return NextResponse.json({ error: 'Permission denied: only admins can remove members' }, { status: 403 });
    }

    // Confirm target is not the workspace owner
    const { data: workspace } = await admin
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (workspace && workspace.owner_id === userId) {
      return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 });
    }

    // Unassign tasks assigned to the removed member in this workspace
    await admin
      .from('tasks')
      .update({ assigned_to: null })
      .eq('workspace_id', workspaceId)
      .eq('assigned_to', userId);

    // Delete workspace member entry
    const { error } = await admin
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[members] DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
