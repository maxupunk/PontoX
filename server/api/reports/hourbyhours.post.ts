import { Point } from "face-api.js";
import { id } from "vuetify/locale";
import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const dateStart = body.dateStart ? body.dateStart : new Date().toString().split('T')[0];
    const dateEnd = body.dateEnd ? body.dateEnd : new Date().toString().split('T')[0];

    const workHours = await prisma.workHour.findMany({
      where: {
        userId: body.userID,
        date: {
          gte: dateStart, // maior ou igual a dataInicial
          lte: dateEnd,  // menor ou igual a dataFinal
        },
      },
      include: {
        points: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (!workHours) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Não existem banco de horas a trabalhar desse usuario.',
      });
    }

    const totalHours = workHours.map((workHour) => {
      const workedTotal = workHour.points.reduce((acc, point) => {
        const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
        const departureDateTime = (point.departureDate !== null) ? new Date(`${point.departureDate}T${point.departureTime}`) : new Date();
        const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
        return acc + totalTimeMinutes;
      }, 0);

      let delayEntryTime = 0;
      let delayDepartureTime = 0;
      if (workHour.points.length) {
        const firstEntry = workHour.points[0];
        const entryDateTime = new Date(`${workHour.date}T${workHour.entryTime}`);
        const entryTime = new Date(`${firstEntry.entryDate}T${firstEntry.entryTime}`);
        delayEntryTime = (entryDateTime.getTime() - entryTime.getTime()) / (1000 * 60);

        const lastPoint = workHour.points[workHour.points.length - 1];
        const departureDateTime = (lastPoint.departureDate !== null) ? new Date(`${lastPoint.departureDate}T${lastPoint.departureTime}`) : new Date();
        const departureTime = new Date(`${workHour.date}T${workHour.departureTime}`);
        delayDepartureTime += (departureTime.getTime() - departureDateTime.getTime()) / (1000 * 60);
      }

      return {
        id: workHour.id,
        date: workHour.date,
        entryTyme: workHour.entryTime,
        departureTime: workHour.departureTime,
        points: workHour.points,
        workedHours: Math.floor(workedTotal / 60),
        workedMinutes: Math.floor(workedTotal % 60),
        delayEntryTime: -delayEntryTime,
        delayDepartureTime: -delayDepartureTime,
      };
    });

    return totalHours;

  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});