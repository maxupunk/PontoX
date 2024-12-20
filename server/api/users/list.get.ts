
import prisma from "~~/server/prisma";

export default defineEventHandler(async () => {
  try {
    const usersResp = await prisma.user.findMany({
      where: {
        status: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        login: true,
      },
      orderBy: [
        { status: 'desc' },
        { id: 'asc' }
      ],
    });

    return {
      users: usersResp,
    };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});