import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  const email = 'support@medicaremastery.com';
  const password = 'support0375';
  const fullName = 'Medicare Mastery Support';

  console.log('Checking if admin user already exists...');

  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', email);

  if (existingUsers && existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    console.log('Admin user already exists:', existingUser.email);

    if (existingUser.role !== 'admin') {
      console.log('Updating user role to admin...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user role:', updateError);
        process.exit(1);
      }
      console.log('User role updated to admin');
    } else {
      console.log('User already has admin role');
    }

    console.log('\n✓ Admin user ready');
    console.log('Email:', email);
    console.log('Password:', password);
    return;
  }

  console.log('Creating new admin user...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      },
      emailRedirectTo: undefined
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    process.exit(1);
  }

  if (!authData.user) {
    console.error('No user data returned from signup');
    process.exit(1);
  }

  console.log('Auth user created:', authData.user.id);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'admin'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    process.exit(1);
  }

  console.log('\n✓ Admin user created successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nYou can now log in with these credentials at /admin');
}

createAdminUser().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
