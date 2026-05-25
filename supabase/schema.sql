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
  invited_by   uuid REFERENCES public.profiles(id),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 4. PROJECTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  color        text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 5. TASKS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id   uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  priority     text NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status       text NOT NULL DEFAULT 'TODO'   CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  assigned_to  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   uuid NOT NULL REFERENCES public.profiles(id),
  due_date     date,
  attachments  text[],
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 6. INVITATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  token        text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  invited_by   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE (workspace_id, email)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 7. SECURITY DEFINER HELPER FUNCTIONS
-- ──────────────────────────────────────────────

-- Helper 1: Check if user is a member of the workspace
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

-- Helper 2: Get member's role in the workspace
CREATE OR REPLACE FUNCTION public.get_workspace_member_role(p_workspace_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;
$$;

-- Helper 3: Check if two users share at least one workspace
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

-- ──────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY POLICIES
-- ──────────────────────────────────────────────

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "profiles: own read" ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;
DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: read shared workspace members" ON public.profiles;

CREATE POLICY "profiles: read shared workspace members" ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.share_workspace(auth.uid(), id));

CREATE POLICY "profiles: own insert" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- --- WORKSPACES POLICIES ---
DROP POLICY IF EXISTS "workspaces: member read" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces: owner insert" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces: owner delete" ON public.workspaces;

CREATE POLICY "workspaces: member read" ON public.workspaces FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "workspaces: owner insert" ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces: owner delete" ON public.workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- --- WORKSPACE MEMBERS POLICIES ---
DROP POLICY IF EXISTS "workspace_members: member read" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: self insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: admin update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: admin delete" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: admin manage" ON public.workspace_members;

CREATE POLICY "workspace_members: member read" ON public.workspace_members FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

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

-- --- PROJECTS POLICIES ---
DROP POLICY IF EXISTS "projects: member read" ON public.projects;
DROP POLICY IF EXISTS "projects: member write" ON public.projects;

CREATE POLICY "projects: member read" ON public.projects FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "projects: member write" ON public.projects FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- --- TASKS POLICIES ---
DROP POLICY IF EXISTS "tasks: member read" ON public.tasks;
DROP POLICY IF EXISTS "tasks: member insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks: member update" ON public.tasks;
DROP POLICY IF EXISTS "tasks: creator or admin delete" ON public.tasks;

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

-- --- INVITATIONS POLICIES ---
DROP POLICY IF EXISTS "invitations: admin manage" ON public.invitations;

CREATE POLICY "invitations: admin manage" ON public.invitations FOR ALL
  TO authenticated
  USING (public.get_workspace_member_role(workspace_id, auth.uid()) IN ('admin', 'manager'));

-- ──────────────────────────────────────────────
-- 9. SECURE RPC FUNCTIONS
-- ──────────────────────────────────────────────
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
  VALUES (
    p_owner_id,
    (SELECT email FROM auth.users WHERE id = p_owner_id),
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p_owner_id)
  )
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

CREATE OR REPLACE FUNCTION public.accept_workspace_invite(
  p_invite_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_email text;
  v_role text;
  v_invited_by uuid;
  v_user_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT workspace_id, email, role, invited_by INTO v_workspace_id, v_email, v_role, v_invited_by
  FROM public.invitations
  WHERE id = p_invite_id;

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF LOWER((SELECT email FROM auth.users WHERE id = v_user_id)) <> LOWER(v_email) THEN
    RAISE EXCEPTION 'Permission denied: email mismatch';
  END IF;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    v_user_id,
    v_email,
    COALESCE(
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id),
      'New User'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by, joined_at)
  VALUES (v_workspace_id, v_user_id, v_role::text, v_invited_by, now())
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  DELETE FROM public.invitations WHERE id = p_invite_id;

  SELECT json_build_object(
    'id', w.id,
    'name', w.name,
    'owner_id', w.owner_id,
    'created_at', w.created_at,
    'role', v_role
  ) INTO v_result
  FROM public.workspaces w
  WHERE w.id = v_workspace_id;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pending_invite_by_email(
  p_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'id', i.id,
    'workspace_id', i.workspace_id,
    'email', i.email,
    'role', i.role,
    'token', i.token,
    'workspace_name', w.name
  ) INTO v_result
  FROM public.invitations i
  JOIN public.workspaces w ON w.id = i.workspace_id
  WHERE LOWER(i.email) = LOWER(p_email)
  LIMIT 1;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workspace_with_member(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_workspace_with_member(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.remove_workspace_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_invite_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_invite_by_email(text) TO anon;

-- Ensure all workspaces have at least one owner in workspace_members
INSERT INTO public.workspace_members (workspace_id, user_id, role)
SELECT w.id, w.owner_id, 'admin'
FROM public.workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id
)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- ──────────────────────────────────────────────
-- 10. GRANT API ACCESS
-- ──────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
