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

const supabase = createClient(supabaseUrl, anonKey);

const email = `newadmin_${Date.now()}@example.com`;
const password = 'Password123';
const name = 'New Admin User';
const wsName = 'My Test Workspace';

async function run() {
  try {
    console.log(`Signing up ${email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (signUpErr) {
      console.error("Sign up error:", signUpErr.message);
      return;
    }

    const user = signUpData.user;
    console.log("Sign up successful! User ID:", user.id);

    // Profile upsert (as auth.service.ts does)
    console.log("Upserting profile...");
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: user.id,
      email: email,
      full_name: name
    }, { onConflict: 'id' });

    if (profileErr) {
      console.error("Profile upsert error:", profileErr.message);
      return;
    }

    // Create workspace using RPC
    console.log("Creating workspace via RPC...");
    const { data: workspace, error: wsError } = await supabase.rpc('create_workspace_with_member', {
      p_name: wsName,
      p_owner_id: user.id
    });

    if (wsError) {
      console.error("Create workspace error:", wsError.message);
      return;
    }

    console.log("Workspace created via RPC:", workspace);

    // Test queries as this user
    console.log("Simulating frontend query for workspace members...");
    const { data: members, error: mErr } = await supabase
      .from('workspace_members')
      .select('*, profiles(id, full_name, email, avatar_url)')
      .eq('workspace_id', workspace.id);
    if (mErr) console.error("Fetch members error:", mErr.message);
    else console.log("Members loaded:", members);

    console.log("Simulating frontend query for tasks...");
    const { data: tasks, error: tErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspace.id);
    if (tErr) console.error("Fetch tasks error:", tErr.message);
    else console.log("Tasks loaded:", tasks);

    console.log("Simulating frontend query for projects...");
    const { data: projects, error: prErr } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspace.id);
    if (prErr) console.error("Fetch projects error:", prErr.message);
    else console.log("Projects loaded:", projects);

  } catch (e) {
    console.error("Execution failed:", e);
  }
}

run();
