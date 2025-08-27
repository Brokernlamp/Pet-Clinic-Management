import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL in environment');
}

if (!supabaseServiceRoleKey) {
  console.warn('Warning: Missing SUPABASE_SERVICE_ROLE_KEY; restricted features may fail');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || '');


