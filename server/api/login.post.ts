import prisma from "../prisma";
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event: any) => {
  try {
    let body = await readBody(event);
    const userQuery = await prisma.users.findFirst({
      where: { login: body.login },
    });

    if (userQuery) {
      const passwordDB = userQuery.password ? userQuery.password : '';
      const result = await bcrypt.compare(body.password, passwordDB);
      if (result) {
        const token = nanoid(36);
        await prisma.users.update({
          where: { id: userQuery.id },
          data: { token },
        });
        return { token };
      }
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});