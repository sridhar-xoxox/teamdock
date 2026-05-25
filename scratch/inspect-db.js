const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
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

if (!supabaseUrl || !serviceKey) {
  console.error("Missing environment variables", { supabaseUrl, hasServiceKey: !!serviceKey });
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

async function run() {
  try {
    console.log("=== INVITATIONS ===");
    const { data: invites, error: inviteErr } = await admin.from('invitations').select('*');
    if (inviteErr) console.error("Error fetching invitations:", inviteErr);
    else console.log(invites);

    console.log("\n=== WORKSPACES ===");
    const { data: workspaces, error: wsErr } = await admin.from('workspaces').select('*');
    if (wsErr) console.error("Error fetching workspaces:", wsErr);
    else console.log(workspaces);

    console.log("\n=== WORKSPACE MEMBERS ===");
    const { data: members, error: memErr } = await admin.from('workspace_members').select('*');
    if (memErr) console.error("Error fetching members:", memErr);
    else console.log(members);

    console.log("\n=== PROFILES ===");
    const { data: profiles, error: profErr } = await admin.from('profiles').select('*');
    if (profErr) console.error("Error fetching profiles:", profErr);
    else console.log(profiles);

  } catch (e) {
    console.error("Failure:", e);
  }
}

run();
