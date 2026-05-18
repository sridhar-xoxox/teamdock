-- =====================================================
-- TeamDock Full Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- Project: dfbkjenftvaqrkpenufa
-- =====================================================

-- ──────────────────────────────────────────────
-- 1. PROFILES (linked to auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles: own insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- 2. WORKSPACES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  owner_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 3. WORKSPACE MEMBERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  invited_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace RLS: only members of the workspace can see it
CREATE POLICY "workspaces: member read" ON public.workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "workspaces: owner insert" ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces: owner delete" ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- workspace_members RLS
CREATE POLICY "workspace_members: member read" ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members: admin manage" ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role = 'admin'
    )
  );

-- Allow new users to insert themselves when accepting an invite
CREATE POLICY "workspace_members: self insert" ON public.workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 4. TASKS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  priority     text NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status       text NOT NULL DEFAULT 'TODO'   CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  assigned_to  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date     date,
  attachments  text[],
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS: workspace members can read tasks
CREATE POLICY "tasks: member read" ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = tasks.workspace_id AND user_id = auth.uid()
    )
  );

-- Workspace members can create tasks
CREATE POLICY "tasks: member insert" ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = tasks.workspace_id AND user_id = auth.uid()
    )
  );

-- Members can update tasks in their workspace
CREATE POLICY "tasks: member update" ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = tasks.workspace_id AND user_id = auth.uid()
    )
  );

-- Only task creator or admin can delete
CREATE POLICY "tasks: creator or admin delete" ON public.tasks FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = tasks.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- ──────────────────────────────────────────────
-- 5. INVITATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  token        text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations: admin manage" ON public.invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- ──────────────────────────────────────────────
-- 6. SECURITY: Lock down rls_auto_enable if it exists
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;
  END IF;
END $$;

-- ──────────────────────────────────────────────
-- 7. GRANT API ACCESS
-- ──────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
