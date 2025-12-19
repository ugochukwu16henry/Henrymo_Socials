const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'henrymo_socials',
  });

  try {
    await client.connect();
    console.log('✅ Direct pg client connection SUCCESS!');
    const res = await client.query('SELECT current_database(), current_user');
    console.log('✅ Query result:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Direct connection failed:', err.message);
    console.error('Error code:', err.code);
    await client.end();
    process.exit(1);
  }
}

testConnection();

