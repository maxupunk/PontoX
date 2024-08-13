import prisma from "~~/server/prisma";

export default defineEventHandler(async () => {
  try {
    const usersResp = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        login: true,
        role: true,
        status: true,
      }
    });
    return { "users": usersResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});