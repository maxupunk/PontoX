import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const dateFilter = query.date ? new Date(query.date as string).toISOString() : null;

    const usersResp = await prisma.bankHour.findMany({
      select: {
        id: true,
        date: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      },
      where: dateFilter ? {
        date: {
          gte: dateFilter
        }
      } : undefined,
      orderBy: [
        { date: 'asc' },
      ],
    });
    return { "users": usersResp };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});