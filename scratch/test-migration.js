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

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  console.log("Calling get_pending_invite_by_email RPC...");
  const { data, error } = await supabase.rpc('get_pending_invite_by_email', {
    p_email: 'nonexistent_test_email@example.com'
  });
  if (error) {
    console.error("RPC Error:", error.message, error.code);
  } else {
    console.log("RPC Success! Response data:", data);
  }
}

run();
