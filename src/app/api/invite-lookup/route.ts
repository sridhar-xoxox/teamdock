import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side route: looks up a pending invitation by email using the service role
// This bypasses RLS so we can join invitations → workspaces freely, even for anon users
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email || !email.includes('@')) {
    return NextResponse.json(null);
  }

  const { data, error } = await admin
    .from('invitations')
    .select('id, workspace_id, email, role, token, workspaces(id, name)')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !data) return NextResponse.json(null);

  // Normalize the shape so the frontend always gets a consistent structure
  const ws = data.workspaces as any;
  return NextResponse.json({
    id: data.id,
    workspace_id: data.workspace_id,
    email: data.email,
    role: data.role,
    token: data.token,
    workspaces: ws ? { id: ws.id, name: ws.name } : null,
  });
}
