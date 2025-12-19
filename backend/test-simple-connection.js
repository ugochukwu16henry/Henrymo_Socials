// Simple connection test without Prisma
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL.replace(/^"|"$/g, ''),
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('✅ Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  }
}

test();

