import prisma from "~/server/prisma";
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    const password = body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    body.password = hashedPassword;
    return await prisma.user.create({
      data: body,
    });
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});