const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
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

async function run() {
  try {
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    console.log("Status code:", res.status);
    const text = await res.text();
    console.log("Raw body starts with:", text.substring(0, 1000));
    const json = JSON.parse(text);
    const paths = json.paths || {};
    console.log("JSON Schema for accept_workspace_invite:");
    console.log(JSON.stringify(paths['/rpc/accept_workspace_invite'], null, 2));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

run();
