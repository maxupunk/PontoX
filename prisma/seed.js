import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin', 10);

    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@admin.com',
        login: 'admin',
        password: hashedPassword,
        token: '',
        role: 'admin',
        status: true,
        points: {
          create: [
            {
              entryDate: '2021-10-10',
              entryTime: '09:00:00',
              entryImage: 'Teste',
              entryExpressio: 'Teste',
              departureDate: '2021-10-10',
              departureTime: '10:00:00',
              departureExpressio: 'Teste',
              departureImage: 'Teste',
              observation: 'Teste',
            }
          ]
        }
      },
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
