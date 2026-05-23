import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route uses the service role to bypass RLS so ANY visitor can check
// if their email has a pending invite — without being authenticated first.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ invite: null });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await adminClient
    .from('invitations')
    .select('*, workspaces(id, name)')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) return NextResponse.json({ invite: null });
  return NextResponse.json({ invite: data });
}
