import prisma from "~/server/prisma";

export default defineEventHandler(async () => {
  try {
    const usersResp = await prisma.user.findMany();
    return { "users": usersResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});