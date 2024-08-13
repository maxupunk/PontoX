import prisma from "~~/server/prisma";
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    if (body.password !== undefined) {
      const password = body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      body.password = hashedPassword;
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: body.email,
          },
          {
            name: body.name,
          },
        ],
      },
    });

    if (user) {
      throw createError({
        status: 400,
        message: 'Usuario ou email já existe',
      });
    }

    const UserInsert = await prisma.user.create({
      data: body,
    });
    
    if (!UserInsert) {
      throw createError({
        status: 400,
        message: 'Erro ao criar usuário',
      });
    } else {
      return true;
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});