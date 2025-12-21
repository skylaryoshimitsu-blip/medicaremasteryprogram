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
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log('Creating test user...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test@medicare-mastery.com',
    password: 'TestPass123!',
    options: {
      data: {
        full_name: 'Test User'
      },
      emailRedirectTo: undefined
    }
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('Auth user created:', authData.user?.id);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        email: 'test@medicare-mastery.com',
        full_name: 'Test User',
        role: 'student',
      },
    ]);

  if (profileError) {
    console.error('Profile error:', profileError);
    return;
  }

  console.log('Profile created successfully');

  const { data: modules } = await supabase
    .from('modules')
    .select('id, phase_number')
    .order('phase_number');

  console.log('Found modules:', modules?.length);

  if (modules && modules.length > 0) {
    const progressRecords = modules.map(module => ({
      user_id: authData.user.id,
      module_id: module.id,
      is_unlocked: true,
      unlocked_at: new Date().toISOString(),
    }));

    const { error: progressError } = await supabase
      .from('user_progress')
      .insert(progressRecords);

    if (progressError) {
      console.error('Progress error:', progressError);
      return;
    }

    console.log('All modules unlocked for test user');
  }

  console.log('\n✅ Test user created successfully!');
  console.log('Email: test@medicare-mastery.com');
  console.log('Password: TestPass123!');
  console.log('All 6 modules are unlocked\n');
}

createTestUser().catch(console.error);
