require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Supabase requires SSL
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase Postgres!');

    // Test query
    const res = await client.query('SELECT NOW()');
    console.log('📅 Current time:', res.rows[0]);

  } catch (err) {
    console.error('❌ Connection error:', err.stack);
  } finally {
    await client.end();
  }
}

testConnection();
