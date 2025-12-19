require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL from env:', process.env.DATABASE_URL?.substring(0, 50) + '...');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('✅ Query test successful:', result);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();


