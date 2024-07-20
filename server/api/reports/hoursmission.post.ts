import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const entryDateStart = body.entryDateStart ? body.entryDateStart : new Date().toString().split('T')[0];
    const entryDateEnd = body.entryDateEnd ? body.entryDateEnd : new Date().toString().split('T')[0];
    const users = await prisma.user.findMany({
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
        workDays: {
          where: {
            date: {
              gte: entryDateStart, // maior ou igual a dataInicial
              lte: entryDateEnd,  // menor ou igual a dataFinal
            },
          },
          include: {
            workHours: true,
          },
        },
      },
    });

    const usersWithFormattedTime = users.map(user => {
      let inWork = false
      const pointTotalMinutes = user.points.reduce((acc, point) => {
        const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
        const departureDateTime = (point.departureDate !== null) ? new Date(`${point.departureDate}T${point.departureTime}`) : new Date();
        if (point.departureDate === null) {
          inWork = true
        }
        const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
        return acc + totalTimeMinutes;
      }, 0);

      const workHoursTotalMinutesSum = user.workDays.reduce((acc, workDay) => {
        const workHoursTotalMinutes = workDay.workHours.reduce((acc, workHour) => {
          const entryDateTime = new Date(`${workDay.date}T${workHour.entryTime}`);
          const departureDateTime = new Date(`${workDay.date}T${workHour.departureTime}`);
          const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
          return acc + totalTimeMinutes;
        }, 0);
        return acc + workHoursTotalMinutes;
      }, 0);

      const percentage = (pointTotalMinutes / workHoursTotalMinutesSum) * 100;

      return {
        id: user.id,
        name: user.name,
        inWork: inWork,
        workedHours: Math.floor(pointTotalMinutes / 60),
        workedMinutes: Math.floor(pointTotalMinutes % 60),
        workPendingHours: Math.floor(workHoursTotalMinutesSum / 60),
        workPendingMinutes: Math.floor(workHoursTotalMinutesSum % 60),
        percentage: parseFloat(percentage.toFixed(2)),
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