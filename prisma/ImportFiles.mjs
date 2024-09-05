import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { da } from 'vuetify/locale';

const prisma = new PrismaClient();

async function readCSV(filePath, headers) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ headers, skipEmptyLines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function main() {
  try {

    let countUsers = 0;
    let countPoints = 0;
    const usersFilePath = path.join('./', process.env.STORAGE_FOLDER, 'users.csv');
    const pointsFilePath = path.join('./', process.env.STORAGE_FOLDER, 'points.csv');

    const userHeaders = ['id', 'name', 'email', 'login', 'password', 'token', 'role', 'status', 'createdAt', 'updatedAt'];
    const pointHeaders = ['id', 'userId', 'entryDate', 'entryTime', 'entryExpressio', 'entryImage', 'departureDate', 'departureTime', 'departureExpressio', 'departureImage', 'observation', 'createdAt', 'updatedAt'];

    const users = await readCSV(usersFilePath, userHeaders);
    const points = await readCSV(pointsFilePath, pointHeaders);

    // Insert users into the database
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: parseInt(user.id, 10) },
        update: {
          name: user.name,
          email: user.email ? user.email : null,
          login: user.login ? user.login : null,
          password: user.password ? user.password : null,
          token: user.token ? user.token : null,
          role: user.role,
          status: user.status === '1',
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
        },
        create: {
          name: user.name,
          email: user.email ? user.email : null,
          login: user.login ? user.login : null,
          password: user.password ? user.password : null,
          token: user.token ? user.token : null,
          role: user.role,
          status: user.status === '1',
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        },
      });
      countUsers++;
      console.log('User inserted successfully:', countUsers);
    }

    // Insert points into the database
    for (const point of points) {
      await prisma.point.upsert({
        where: { id: parseInt(point.id, 10) },
        update: {
          user: {
            connect: { id: parseInt(point.userId, 10) },
          },
          entryDate: point.entryDate,
          entryTime: point.entryTime,
          entryExpressio: point.entryExpressio,
          entryImage: point.entryImage,
          departureDate: point.departureDate,
          departureTime: point.departureTime,
          departureExpressio: point.departureExpressio,
          departureImage: point.departureImage,
          observation: point.observation,
          createdAt: point.createdAt ? new Date(point.createdAt) : new Date(),
          updatedAt: point.updatedAt ? new Date(point.updatedAt) : new Date(),
        },
        create: {
          user: {
            connect: { id: parseInt(point.userId, 10) },
          },
          entryDate: point.entryDate,
          entryTime: point.entryTime,
          entryExpressio: point.entryExpressio,
          entryImage: point.entryImage,
          departureDate: point.departureDate,
          departureTime: point.departureTime,
          departureExpressio: point.departureExpressio,
          departureImage: point.departureImage,
          observation: point.observation,
          createdAt: point.createdAt ? new Date(point.createdAt) : new Date(),
          updatedAt: point.updatedAt ? new Date(point.updatedAt) : new Date(),
        },
      });
      countPoints++;
      console.log('Point inserted successfully:', countPoints);
    }

    console.log('Data inserted successfully', `Usuarios: ${countUsers} - Points: ${countPoints}`);

  } catch (e) {
    console.error(e);
    throw e;
  }
}

main()
  .then(async () => {
    console.log('files imported successfully');
  })
  .catch((e) => {
    console.error('ÁQUI O ERRO:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
