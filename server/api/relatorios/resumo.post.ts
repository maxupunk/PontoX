import prisma from "../../prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const entryDateStart = body.entryDateStart ? body.entryDateStart : '';
    const entryDateEnd = body.entryDateEnd ? body.entryDateEnd : new Date().toISOString().split('T')[0];
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        points: {
          where: {
            entryDate: {
              gte: entryDateStart, // maior ou igual a dataInicial
              lte: entryDateEnd,  // menor ou igual a dataFinal
            },
          },
        },
      },
    });

    const usersWithFormattedTime = users.map(user => {
      const totalMinutesSum = user.points.reduce((acc, point) => {
        const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
        const departureDateTime = new Date(`${point.departureDate}T${point.departureTime}`);
        const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
        return acc + totalTimeMinutes;
      }, 0);

      return {
        id: user.id,
        name: user.name,
        hours: Math.floor(totalMinutesSum / 60),
        minuites: totalMinutesSum % 60
      };
    });

    return usersWithFormattedTime;
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});