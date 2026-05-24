const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').replace(/"/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use the public anon client, simulating the web application
const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    console.log(`Signing up as ${testEmail}...`);
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Password123!',
      options: {
        data: { full_name: 'Test User' }
      }
    });

    if (authErr) {
      console.error("Signup failed:", authErr.message);
      return;
    }

    const user = authData.user;
    console.log("Logged in user ID:", user.id);

    console.log("Fetching profile...");
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (pErr) console.error("Profile error:", pErr);
    else console.log("Profile:", profile);

    console.log("Creating workspace using RPC...");
    const { data: workspace, error: wsError } = await supabase.rpc('create_workspace_with_member', {
      p_name: 'Test Workspace',
      p_owner_id: user.id
    });
    if (wsError) console.error("Create Workspace Error:", wsError);
    else console.log("Workspace created via RPC:", workspace);

    console.log("Fetching workspaces...");
    const { data: workspaces, error: wErr } = await supabase
      .from('workspace_members')
      .select('role, workspace_id, workspaces(id, name, owner_id, created_at)')
      .eq('user_id', user.id);
    if (wErr) console.error("Workspaces error:", wErr);
    else console.log("Workspaces:", workspaces);

    if (workspaces && workspaces.length > 0) {
      const firstWs = workspaces[0];
      const wsId = firstWs.workspace_id;
      console.log(`Using first workspace ID: ${wsId}`);

      console.log("Fetching members...");
      const { data: members, error: mErr } = await supabase
        .from('workspace_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('workspace_id', wsId);
      if (mErr) console.error("Members error:", mErr);
      else console.log("Members count:", members ? members.length : 0, members);

      console.log("Fetching tasks...");
      const { data: tasks, error: tErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', wsId);
      if (tErr) console.error("Tasks error:", tErr);
      else console.log("Tasks count:", tasks ? tasks.length : 0, tasks);

      console.log("Fetching projects...");
      const { data: projects, error: prErr } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', wsId);
      if (prErr) console.error("Projects error:", prErr);
      else console.log("Projects count:", projects ? projects.length : 0, projects);

      console.log("Fetching invitations...");
      const { data: invites, error: iErr } = await supabase
        .from('invitations')
        .select('*')
        .eq('workspace_id', wsId);
      if (iErr) console.error("Invitations error:", iErr);
      else console.log("Invitations count:", invites ? invites.length : 0, invites);
    }

  } catch (e) {
    console.error("Test failed:", e);
  }
}

run();
