import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ONE-TIME migration endpoint - DELETE THIS FILE after running
// Access at: GET http://localhost:3000/api/admin/migrate-workspace-rls

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    return NextResponse.json({ error: 'No service role key' }, { status: 403 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const results: any[] = [];

  // Define SQL migration commands to resolve RLS recursion
  const sqlCommands = `
    -- 1. Create SECURITY DEFINER helper functions to break recursion
    CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = p_workspace_id AND user_id = p_user_id
      );
    $$;

    CREATE OR REPLACE FUNCTION public.get_workspace_member_role(p_workspace_id uuid, p_user_id uuid)
    RETURNS text
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT role FROM public.workspace_members
      WHERE workspace_id = p_workspace_id AND user_id = p_user_id;
    $$;

    CREATE OR REPLACE FUNCTION public.share_workspace(p_user_id1 uuid, p_user_id2 uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.workspace_members wm1
        JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
        WHERE wm1.user_id = p_user_id1 AND wm2.user_id = p_user_id2
      );
    $$;

    -- 2. Drop restrictive/recursive policies for profiles
    DROP POLICY IF EXISTS "profiles: own read" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by users who share workspace." ON public.profiles;
    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles: read shared workspace members" ON public.profiles;

    -- 3. Create non-recursive policies for profiles
    CREATE POLICY "profiles: read shared workspace members" ON public.profiles FOR SELECT
      TO authenticated
      USING (id = auth.uid() OR public.share_workspace(auth.uid(), id));

    CREATE POLICY "profiles: own insert" ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());

    CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid());

    -- 4. Drop restrictive/recursive policies for workspaces
    DROP POLICY IF EXISTS "workspaces: member read" ON public.workspaces;
    DROP POLICY IF EXISTS "workspaces: owner insert" ON public.workspaces;
    DROP POLICY IF EXISTS "workspaces: owner delete" ON public.workspaces;

    -- 5. Create non-recursive policies for workspaces
    CREATE POLICY "workspaces: member read" ON public.workspaces FOR SELECT
      TO authenticated
      USING (public.is_workspace_member(id, auth.uid()));

    CREATE POLICY "workspaces: owner insert" ON public.workspaces FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);

    CREATE POLICY "workspaces: owner delete" ON public.workspaces FOR DELETE
      TO authenticated
      USING (auth.uid() = owner_id);

    -- 6. Drop restrictive/recursive policies for workspace_members
    DROP POLICY IF EXISTS "workspace_members: member read" ON public.workspace_members;
    DROP POLICY IF EXISTS "workspace_members: self insert" ON public.workspace_members;
    DROP POLICY IF EXISTS "workspace_members: admin update" ON public.workspace_members;
    DROP POLICY IF EXISTS "workspace_members: admin delete" ON public.workspace_members;
    DROP POLICY IF EXISTS "workspace_members: member delete" ON public.workspace_members;
    DROP POLICY IF EXISTS "workspace_members: admin manage" ON public.workspace_members;

    -- 7. Create non-recursive policies for workspace_members
    CREATE POLICY "workspace_members: member read" ON public.workspace_members FOR SELECT
      TO authenticated
      USING (public.is_workspace_member(workspace_id, auth.uid()));

    CREATE POLICY "workspace_members: self insert" ON public.workspace_members FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "workspace_members: admin update" ON public.workspace_members FOR UPDATE
      TO authenticated
      USING (public.get_workspace_member_role(workspace_id, auth.uid()) IN ('admin', 'manager'));

    CREATE POLICY "workspace_members: admin delete" ON public.workspace_members FOR DELETE
      TO authenticated
      USING (
        user_id = auth.uid()
        OR
        public.get_workspace_member_role(workspace_id, auth.uid()) = 'admin'
      );

    -- 8. Drop restrictive/recursive policies for tasks
    DROP POLICY IF EXISTS "tasks: member read" ON public.tasks;
    DROP POLICY IF EXISTS "tasks: member insert" ON public.tasks;
    DROP POLICY IF EXISTS "tasks: member update" ON public.tasks;
    DROP POLICY IF EXISTS "tasks: creator or admin delete" ON public.tasks;

    -- 9. Create non-recursive policies for tasks
    CREATE POLICY "tasks: member read" ON public.tasks FOR SELECT
      TO authenticated
      USING (public.is_workspace_member(workspace_id, auth.uid()));

    CREATE POLICY "tasks: member insert" ON public.tasks FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by AND public.is_workspace_member(workspace_id, auth.uid()));

    CREATE POLICY "tasks: member update" ON public.tasks FOR UPDATE
      TO authenticated
      USING (public.is_workspace_member(workspace_id, auth.uid()));

    CREATE POLICY "tasks: creator or admin delete" ON public.tasks FOR DELETE
      TO authenticated
      USING (
        auth.uid() = created_by OR
        public.get_workspace_member_role(workspace_id, auth.uid()) IN ('admin', 'manager')
      );

    -- 10. Drop and create invitations policies
    DROP POLICY IF EXISTS "invitations: admin manage" ON public.invitations;

    CREATE POLICY "invitations: admin manage" ON public.invitations FOR ALL
      TO authenticated
      USING (public.get_workspace_member_role(workspace_id, auth.uid()) IN ('admin', 'manager'));

    -- 11. Create or replace secure RPC functions
    CREATE OR REPLACE FUNCTION public.create_workspace_with_member(
      p_name       text,
      p_owner_id   uuid
    )
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      v_workspace_id uuid;
      v_result json;
    BEGIN
      IF auth.uid() IS NOT NULL AND auth.uid() <> p_owner_id THEN
        RAISE EXCEPTION 'Permission denied: caller does not match owner_id';
      END IF;

      INSERT INTO public.profiles (id, email, full_name)
      SELECT p_owner_id, u.email, u.raw_user_meta_data->>'full_name'
      FROM auth.users u
      WHERE u.id = p_owner_id
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.workspaces (name, owner_id)
      VALUES (p_name, p_owner_id)
      RETURNING id INTO v_workspace_id;

      INSERT INTO public.workspace_members (workspace_id, user_id, role)
      VALUES (v_workspace_id, p_owner_id, 'admin')
      ON CONFLICT (workspace_id, user_id) DO NOTHING;

      SELECT row_to_json(w) INTO v_result
      FROM public.workspaces w
      WHERE w.id = v_workspace_id;

      RETURN v_result;
    END;
    $$;

    CREATE OR REPLACE FUNCTION public.remove_workspace_member(
      p_workspace_id uuid,
      p_user_id      uuid
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      v_caller_role text;
    BEGIN
      SELECT role INTO v_caller_role
      FROM public.workspace_members
      WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

      IF v_caller_role IS NULL OR v_caller_role <> 'admin' THEN
        RAISE EXCEPTION 'Permission denied: only admins can remove workspace members';
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE id = p_workspace_id AND owner_id = p_user_id
      ) THEN
        RAISE EXCEPTION 'Cannot remove the workspace owner';
      END IF;

      UPDATE public.tasks
      SET assigned_to = NULL
      WHERE workspace_id = p_workspace_id AND assigned_to = p_user_id;

      DELETE FROM public.workspace_members
      WHERE workspace_id = p_workspace_id AND user_id = p_user_id;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.create_workspace_with_member(text, uuid) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.create_workspace_with_member(text, uuid) TO anon;
    GRANT EXECUTE ON FUNCTION public.remove_workspace_member(uuid, uuid) TO authenticated;

    -- 12. Fix orphaned workspaces
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    SELECT w.id, w.owner_id, 'admin'
    FROM public.workspaces w
    WHERE NOT EXISTS (
      SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id
    )
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  `;

  // Execute via Supabase SQL API (if enabled) or internal Studio pg endpoint
  const executeSQL = async (sql: string, label: string) => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/run_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (response.status === 404) {
        // Fallback to internal Studio query
        const r2 = await fetch(`${supabaseUrl}/pg/query`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql }),
        });
        const text = await r2.text();
        results.push({ label, status: r2.status, body: text.substring(0, 200) });
        return;
      }

      const text = await response.text();
      results.push({ label, status: response.status, body: text.substring(0, 200) });
    } catch (e: any) {
      results.push({ label, error: e.message });
    }
  };

  await executeSQL(sqlCommands, 'run_full_migration');

  // Verify functions
  const { error: err1 } = await (admin.rpc as any)('create_workspace_with_member', {
    p_name: '__test__',
    p_owner_id: '9a016d70-099a-4025-a726-d567cd8bd887',
  });
  const fn1Exists = !(err1?.code === 'PGRST202');

  const { error: err2 } = await (admin.rpc as any)('remove_workspace_member', {
    p_workspace_id: '9a016d70-099a-4025-a726-d567cd8bd887',
    p_user_id: '9a016d70-099a-4025-a726-d567cd8bd887',
  });
  const fn2Exists = !(err2?.code === 'PGRST202');

  return NextResponse.json({
    results,
    create_workspace_with_member_exists: fn1Exists,
    remove_workspace_member_exists: fn2Exists,
    errors: {
      create_workspace_with_member: err1?.message,
      remove_workspace_member: err2?.message,
    }
  });
}
