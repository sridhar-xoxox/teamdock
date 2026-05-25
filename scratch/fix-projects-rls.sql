-- Fix: Projects RLS policy missing WITH CHECK for INSERT
-- The "projects: member write" policy only has USING (for existing rows)
-- but INSERT needs WITH CHECK (for new rows).
-- Solution: Drop the combined ALL policy and create separate policies.

DROP POLICY IF EXISTS "projects: member write" ON public.projects;

-- Allow workspace members to INSERT new projects
CREATE POLICY "projects: member insert" ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- Allow workspace members to UPDATE existing projects
CREATE POLICY "projects: member update" ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Allow workspace members to DELETE existing projects
CREATE POLICY "projects: member delete" ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
