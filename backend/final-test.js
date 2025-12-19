const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('✅ SUCCESS! Connected to database');
    return prisma.$queryRaw`SELECT current_database(), current_user, version()`;
  })
  .then((result) => {
    console.log('✅ Database info:', result[0]);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('✅ Test complete - backend should work now!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    prisma.$disconnect();
    process.exit(1);
  });

