import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = query?.search as string;
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [pointsResp, total] = await Promise.all([
      prisma.point.findMany({
        select: {
          id: true,
          entryDate: true,
          entryTime: true,
          departureDate: true,
          departureTime: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        where: search ? {
          user: {
            name: {
              contains: search
            }
          }
        } : undefined,
        orderBy: {
          id: 'desc',
        },
        skip,
        take: limit,
      }),
      // total count
      prisma.point.count(),
    ]);

    return {
      data: pointsResp.map(point => ({
        id: point.id,
        name: point.user?.name,
        entryDate: point.entryDate,
        entryTime: point.entryTime,
        departureDate: point.departureDate,
        departureTime: point.departureTime,
      })),
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});