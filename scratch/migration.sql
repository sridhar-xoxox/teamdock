-- 1. Remove insecure self-insert policy for workspace members
DROP POLICY IF EXISTS "workspace_members: self insert" ON public.workspace_members;

-- 1.5. Clean up old function signatures to prevent overloading
DROP FUNCTION IF EXISTS public.accept_workspace_invite(uuid);
DROP FUNCTION IF EXISTS public.accept_workspace_invite(text);
DROP FUNCTION IF EXISTS public.get_pending_invite_by_email(text);

-- 2. Create accept_workspace_invite function
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

-- 3. Create get_pending_invite_by_email function
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

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_workspace_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_invite_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_invite_by_email(text) TO anon;
