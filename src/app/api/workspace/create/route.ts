import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json({ error: 'name and userId required' }, { status: 400 });
    }

    // Use service role key — bypasses ALL RLS policies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Verify the userId matches a real auth user (security check)
    const { data: { user: authUser }, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !authUser) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 403 });
    }

    // 1. Ensure the user's profile exists
    await admin.from('profiles').upsert({
      id: userId,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
    }, { onConflict: 'id' });

    // 2. Insert into workspaces
    const { data: workspace, error: wsError } = await admin
      .from('workspaces')
      .insert({ name, owner_id: userId })
      .select()
      .single();

    if (wsError || !workspace) {
      return NextResponse.json({ error: wsError?.message || 'Failed to create workspace' }, { status: 500 });
    }

    // 3. Insert workspace member relation as admin
    const { error: memberError } = await admin
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json(workspace);
  } catch (err: any) {
    console.error('[workspace-create] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
