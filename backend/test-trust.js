const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('✅ Query successful:', result[0]);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();

