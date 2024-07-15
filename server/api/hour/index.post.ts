import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    if (!body.workDayId && !body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: "workDayId is required",
      });
    }
    // If date is passed, create a workDay
    if (body.date) {
      const workDay = await prisma.workDay.upsert({
        where: {
          date_userId: {
            date: body.date,
            userId: body.userId,
          }
        },
        update: {},
        create: {
          date: body.date,
          userId: body.userId,
        },
      });
      if (!workDay) {
        throw createError({
          statusCode: 400,
          statusMessage: "workDay not found",
        });
      }
      body.workDayId = workDay.id;
    }
    // Create workHour
    return await prisma.workHour.create({
      data: {
        entryTime: body.entryTime,
        departureTime: body.departureTime,
        workDayId: body.workDayId,
      },
    });
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});