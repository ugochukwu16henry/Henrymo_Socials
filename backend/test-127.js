require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

console.log('Testing connection with:', process.env.DATABASE_URL?.substring(0, 60) + '...');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => {
    console.log('✅ SUCCESS! Connected to database');
    return prisma.$queryRaw`SELECT current_database(), current_user`;
  })
  .then((result) => {
    console.log('✅ Database info:', result[0]);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('✅ Backend should work now!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error('Error code:', err.code || 'N/A');
    prisma.$disconnect();
    process.exit(1);
  });

