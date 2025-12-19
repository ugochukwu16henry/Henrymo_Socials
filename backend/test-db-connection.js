require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return prisma.$queryRaw`SELECT current_database(), current_user`;
  })
  .then((result) => {
    console.log('✅ Query result:', result[0]);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('✅ Test passed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error('Error code:', err.code);
    prisma.$disconnect();
    process.exit(1);
  });

