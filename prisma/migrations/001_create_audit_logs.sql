-- ============================================================
-- Migration: 001_create_audit_logs
-- QuickTask – Audit Log Table
-- ============================================================

-- Enum for action types (mirrors Prisma schema)
DO $$ BEGIN
  CREATE TYPE "ActionType" AS ENUM (
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_DELETED',
    'LIST_CREATED',
    'LIST_UPDATED',
    'LIST_DELETED',
    'MEMBER_ADDED',
    'MEMBER_REMOVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── audit_logs table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action_type "ActionType" NOT NULL,
  user_id     TEXT        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  task_id     TEXT        REFERENCES public.tasks(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_task_id    ON public.audit_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Only the service role can insert (audit writes go through the API route)
-- The INSERT policy is intentionally left open to service_role (bypasses RLS)

-- ── Realtime (optional) ───────────────────────────────────────────────────────
-- Uncomment to stream audit events to connected clients
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
