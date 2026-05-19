-- =====================================================
-- FIX: "Failed to delete selected users: Database error deleting user"
-- Run this in: Supabase Dashboard → SQL Editor
-- This script ensures all foreign key constraints have ON DELETE CASCADE or ON DELETE SET NULL,
-- allowing clean cascading deletions when a user is deleted from auth.users.
-- =====================================================

-- 1. Profiles to Auth.Users (Cascade deletion of profile when user is deleted)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Workspaces to Profiles (Cascade deletion of workspace when owner profile is deleted)
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Workspace Members to Workspaces (Cascade deletion of membership when workspace is deleted)
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_fkey;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_workspace_id_fkey 
  FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 4. Workspace Members to Profiles (Cascade deletion of membership when user profile is deleted)
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Workspace Members invited_by to Profiles (Set to null if the inviter is deleted)
ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_invited_by_fkey;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_invited_by_fkey 
  FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 6. Tasks to Workspaces (Cascade deletion of task when workspace is deleted)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_workspace_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_workspace_id_fkey 
  FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 7. Tasks assigned_to to Profiles (Set to null when assignee is deleted)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 8. Tasks created_by to Profiles (Set to null when creator is deleted)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 9. Invitations to Workspaces (Cascade deletion of invite when workspace is deleted)
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_workspace_id_fkey;
ALTER TABLE public.invitations ADD CONSTRAINT invitations_workspace_id_fkey 
  FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
