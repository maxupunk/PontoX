import prisma from "~~/server/prisma";

export default defineEventHandler(async () => {
  try {
    const pointsResp = await prisma.point.findMany({
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
      orderBy: {
        id: 'desc',
      },
    });
    return { points: pointsResp.map(point => ({
      id: point.id,
      name: point.user?.name,
      entryDate: point.entryDate,
      entryTime: point.entryTime,
      departureDate: point.departureDate,
      departureTime: point.departureTime,
    })) }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});