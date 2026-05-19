-- =====================================================
-- FIX: "Database error deleting user"
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================
-- The old "workspace_members: admin manage" FOR ALL policy
-- caused a self-referencing RLS evaluation during DELETE, which
-- made Supabase throw "Database error deleting user".
-- This migration replaces it with:
--   1. An explicit UPDATE-only admin policy (safe, no recursion)
--   2. A SECURITY DEFINER RPC that handles member removal atomically
-- =====================================================

-- Step 1: Drop the broken catch-all policy
DROP POLICY IF EXISTS "workspace_members: admin manage" ON public.workspace_members;

-- Step 2: Add a safe admin UPDATE policy (role changes only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workspace_members'
      AND policyname = 'workspace_members: admin update'
  ) THEN
    CREATE POLICY "workspace_members: admin update" ON public.workspace_members FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role = 'admin'
        )
      );
  END IF;
END $$;

-- Step 3: Create the SECURITY DEFINER RPC that safely removes a member
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
  -- Verify the caller is an admin of this workspace
  SELECT role INTO v_caller_role
  FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: only admins can remove workspace members';
  END IF;

  -- Safety: prevent removing the workspace owner
  IF EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = p_workspace_id AND owner_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Cannot remove the workspace owner';
  END IF;

  -- Unassign tasks to clear FK references before removing member
  UPDATE public.tasks
  SET assigned_to = NULL
  WHERE workspace_id = p_workspace_id
    AND assigned_to = p_user_id;

  -- Remove the member row
  DELETE FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
    AND user_id = p_user_id;
END;
$$;

-- Step 4: Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.remove_workspace_member(uuid, uuid) TO authenticated;
