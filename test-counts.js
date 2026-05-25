const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').replace(/"/g, '').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  try {
    console.log("Checking DB counts...");
    
    const { data: workspaces, error: wsErr } = await supabase.from('workspaces').select('*');
    if (wsErr) console.error("Workspaces error:", wsErr);
    else console.log(`Workspaces count: ${workspaces.length}`, workspaces);

    const { data: members, error: mErr } = await supabase.from('workspace_members').select('*');
    if (mErr) console.error("Workspace members error:", mErr);
    else console.log(`Workspace members count: ${members.length}`, members);

    const { data: projects, error: pErr } = await supabase.from('projects').select('*');
    if (pErr) console.error("Projects error:", pErr);
    else console.log(`Projects count: ${projects.length}`, projects);

    const { data: tasks, error: tErr } = await supabase.from('tasks').select('*');
    if (tErr) console.error("Tasks error:", tErr);
    else console.log(`Tasks count: ${tasks.length}`, tasks);

    const { data: profiles, error: prErr } = await supabase.from('profiles').select('*');
    if (prErr) console.error("Profiles error:", prErr);
    else console.log(`Profiles count: ${profiles.length}`, profiles);

  } catch (e) {
    console.error("Failed to run check:", e);
  }
}

run();
