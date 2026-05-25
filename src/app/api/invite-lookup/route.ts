import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email || !email.includes('@')) {
    return NextResponse.json(null);
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(null, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data, error } = await admin
    .from('invitations')
    .select('id, workspace_id, email, role, token, workspaces(id, name)')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !data) return NextResponse.json(null);

  // Validate the referenced workspace still exists
  const ws = data.workspaces as any;
  if (!ws || !ws.id) {
    // The workspace was deleted — clean up the orphaned invitation silently
    await admin.from('invitations').delete().eq('id', data.id);
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: data.id,
    workspace_id: data.workspace_id,
    email: data.email,
    role: data.role,
    token: data.token,
    workspaces: { id: ws.id, name: ws.name },
  });
}
