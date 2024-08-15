import prisma from "../prisma";
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event: any) => {
  try {
    let body = await readBody(event);
    const userQuery = await prisma.user.findFirst({
      where: { login: body.login },
    });

    if (!userQuery) {
      throw createError({
        status: 400,
        message: 'Usuário e senha inválidos',
      });
    }

    if (userQuery) {
      const passwordDB = userQuery.password ? userQuery.password : '';
      const result = await bcrypt.compare(body.password, passwordDB);
      if (result) {
        const token = nanoid(36);
        await prisma.user.update({
          where: { id: userQuery.id },
          data: { token },
        });
        return { token };
      }
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});