import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, userId } = body as { workspaceId: string; userId: string };

    if (!workspaceId || !userId) {
      return NextResponse.json({ error: 'workspaceId and userId are required' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Check if the member exists in the workspace
    const { data: member, error: me } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (me || !member) {
      return NextResponse.json({ error: 'Member not found in workspace' }, { status: 404 });
    }

    // 2. Get the member's email (for invitation cleanup)
    const { data: userRecord } = await admin.auth.admin.getUserById(userId);
    const memberEmail = userRecord?.user?.email;

    // 3. Get the workspace owner ID to reassign tasks created by this user
    const { data: wsData } = await admin
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();
    const ownerId = wsData?.owner_id;

    if (ownerId && ownerId !== userId) {
      // Reassign tasks created by this user in this workspace to the workspace owner
      await admin
        .from('tasks')
        .update({ created_by: ownerId })
        .eq('workspace_id', workspaceId)
        .eq('created_by', userId);
    }

    // 4. Unassign tasks assigned to the member in this workspace
    await admin
      .from('tasks')
      .update({ assigned_to: null })
      .eq('workspace_id', workspaceId)
      .eq('assigned_to', userId);

    // 5. Nullify invited_by references in workspace_members for this user
    await admin
      .from('workspace_members')
      .update({ invited_by: null })
      .eq('workspace_id', workspaceId)
      .eq('invited_by', userId);

    // 6. Remove the member from workspace_members table
    const { error: deleteErr } = await admin
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (deleteErr) {
      return NextResponse.json({ error: `Failed to delete workspace member: ${deleteErr.message}` }, { status: 500 });
    }

    // 7. Clean up any pending invitations for this email in this workspace
    if (memberEmail) {
      await admin
        .from('invitations')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('email', memberEmail.toLowerCase());
    }

    // 8. Check if the user is a member of any other workspaces
    const { count, error: countErr } = await admin
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const belongsToOtherWorkspaces = !countErr && count && count > 0;

    if (!belongsToOtherWorkspaces) {
      // User has no workspaces left — safely delete profile and auth account
      
      // Nullify any invited_by fields globally in workspace_members
      await admin
        .from('workspace_members')
        .update({ invited_by: null })
        .eq('invited_by', userId);

      // Reassign any tasks globally to workspace owners
      const { data: userTasks } = await admin
        .from('tasks')
        .select('id, workspace_id')
        .eq('created_by', userId);

      if (userTasks && userTasks.length > 0) {
        for (const task of userTasks) {
          const { data: tWs } = await admin
            .from('workspaces')
            .select('owner_id')
            .eq('id', task.workspace_id)
            .single();
          if (tWs?.owner_id) {
            await admin
              .from('tasks')
              .update({ created_by: tWs.owner_id })
              .eq('id', task.id);
          }
        }
      }

      // Delete the user from the profiles table
      const { error: profileDeleteErr } = await admin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteErr) {
        console.error('[remove-member] Profile delete error:', profileDeleteErr.message);
      }

      // Permanently delete the user from Supabase Auth users list
      const { error: authDeleteErr } = await admin.auth.admin.deleteUser(userId);
      if (authDeleteErr) {
        console.error('[remove-member] Auth delete error:', authDeleteErr.message);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[remove-member] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
