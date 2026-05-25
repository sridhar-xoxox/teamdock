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

const admin = createClient(supabaseUrl, serviceKey);

async function run() {
  const { data: ws } = await admin.from('workspaces').select('*').eq('id', '5be90b5e-fda9-4274-8068-a215c4394784');
  console.log("Workspace 5be90b5e-fda9-4274-8068-a215c4394784:", ws);

  const { data: inv } = await admin.from('invitations').select('*').eq('id', 'a4598e76-d894-4064-8771-fc527773c2cf');
  console.log("Invitation a4598e76-d894-4064-8771-fc527773c2cf:", inv);
}

run();
