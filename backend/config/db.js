const { createClient } = require('@supabase/supabase-js');

// Supabase URL & KEY from your Supabase project (store in .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create a single Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
const connectDB = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1); // simple test query
    if (error) throw error;
    console.log('Supabase Connected ✅');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { supabase, connectDB };
