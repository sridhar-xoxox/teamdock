-- =====================================================
-- TeamDock Invite Flow Fix
-- Paste this in: Supabase Dashboard → SQL Editor → Run
-- =====================================================

-- STEP 1: Restore self-insert policy on workspace_members
-- (Needed so invited users can add themselves on accept)
DROP POLICY IF EXISTS "workspace_members: self insert" ON public.workspace_members;
CREATE POLICY "workspace_members: self insert" ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- STEP 2: Fix invitations policies
-- Allow pre-signup email lookup (anon) + admins to manage
DROP POLICY IF EXISTS "invitations: admin manage" ON public.invitations;
DROP POLICY IF EXISTS "invitations: read by email" ON public.invitations;
DROP POLICY IF EXISTS "invitations: self delete on accept" ON public.invitations;

-- Admins/managers: full control
CREATE POLICY "invitations: admin manage" ON public.invitations FOR ALL
  TO authenticated
  USING (public.get_workspace_member_role(workspace_id, auth.uid()) IN ('admin', 'manager'));

-- Anyone can read invitations (allows pre-signup detection by email)
CREATE POLICY "invitations: read by email" ON public.invitations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Invited user can delete their own invite when accepting
CREATE POLICY "invitations: self delete on accept" ON public.invitations FOR DELETE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- STEP 3: Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
