import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// GET handler: Fetch all tasks for a workspace
export async function GET(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is a member of the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: tasks, error } = await admin
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err: any) {
    console.error('[tasks] GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// POST handler: Create a new task
export async function POST(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, title, description, priority, status, due_date, assigned_to } = body;

    if (!workspaceId || !title) {
      return NextResponse.json({ error: 'workspaceId and title are required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Verify caller is a member of the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: task, error } = await admin
      .from('tasks')
      .insert({
        workspace_id: workspaceId,
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        due_date,
        assigned_to,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(task);
  } catch (err: any) {
    console.error('[tasks] POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// PUT handler: Update an existing task
export async function PUT(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updates } = await req.json();
    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Fetch the task first to verify workspace membership
    const { data: task, error: getTaskErr } = await admin
      .from('tasks')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (getTaskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify caller is a member of the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', task.workspace_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Remove any fields that cannot be updated directly or should be ignored
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;
    delete cleanUpdates.created_at;
    delete cleanUpdates.created_by;
    delete cleanUpdates.workspace_id;

    const { data: updatedTask, error } = await admin
      .from('tasks')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedTask);
  } catch (err: any) {
    console.error('[tasks] PUT error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE handler: Delete a task
export async function DELETE(req: NextRequest) {
  try {
    const serverSupabase = createServerClient();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = req.nextUrl.searchParams.get('id');
    if (!taskId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    // Fetch the task first to check workspace membership
    const { data: task, error: getTaskErr } = await admin
      .from('tasks')
      .select('workspace_id, created_by')
      .eq('id', taskId)
      .single();

    if (getTaskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify caller is a member of the workspace
    const { data: callerMember } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', task.workspace_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!callerMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Admins, managers, or the task creator can delete tasks
    if (callerMember.role !== 'admin' && callerMember.role !== 'manager' && task.created_by !== user.id) {
      return NextResponse.json({ error: 'Permission denied: cannot delete task' }, { status: 403 });
    }

    const { error } = await admin
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[tasks] DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
