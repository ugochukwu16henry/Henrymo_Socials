/**
 * Script to set a user as admin
 * Usage: npx ts-node scripts/set-admin.ts <email>
 * Example: npx ts-node scripts/set-admin.ts henry@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    console.log(`✅ Successfully set ${updated.name} (${updated.email}) as admin`);
    console.log(JSON.stringify(updated, null, 2));
  } catch (error: any) {
    console.error('❌ Error setting admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx ts-node scripts/set-admin.ts <email>');
  console.log('Example: npx ts-node scripts/set-admin.ts henry@example.com');
  process.exit(1);
}

setAdmin(email);

