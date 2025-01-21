import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin', 10);

    await prisma.tenant.create({
      data: {
        name: 'Admin Tenant',
        active: true,
        User: {
          create: {
            name: 'Admin User',
            email: 'admin@admin.com',
            login: 'admin',
            password: hashedPassword,
            rule: 'admin',
            status: true,
          }
        }
      }
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

main()
  .then(() => {
    console.log('Seed data created successfully');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
