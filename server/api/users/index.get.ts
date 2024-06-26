import prisma from "../../prisma";

export default defineEventHandler(async () => {
  try {
    const usersResp = await prisma.users.findMany();
    return { "users": usersResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});