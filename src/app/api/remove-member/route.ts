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

    // 2. Unassign tasks assigned to the member in this workspace
    await admin
      .from('tasks')
      .update({ assigned_to: null })
      .eq('workspace_id', workspaceId)
      .eq('assigned_to', userId);

    // 3. Remove the member from workspace_members table
    const { error: deleteErr } = await admin
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (deleteErr) {
      return NextResponse.json({ error: `Failed to delete workspace member: ${deleteErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[remove-member] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
