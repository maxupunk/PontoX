import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    if (!body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: "workDayId is required",
      });
    }
    const workHour = await prisma.workHour.findFirst({
      where: {
        date: body.date,
        userId: body.userId,
      },
    })
    if (workHour) {
        if (workHour.entryTime === body.entryTime && workHour.departureTime === body.departureTime) {
          return { workHour: workHour, message: "Já existe esse horario para esse funcionario" };
        }
        if ((body.entryTime < workHour.departureTime && body.departureTime > workHour.entryTime)) {
          return { workHour: workHour, message: "Existe e há um choque de horário com esse dados digitado." };
        }
    }
    // Create workHour
    const workHourCreted = await prisma.workHour.create({
      data: {
        date: body.date,
        entryTime: body.entryTime,
        departureTime: body.departureTime,
      },
    });
    if (workHourCreted) {
      setResponseStatus(event, 201)
      return { workHour: workHourCreted, message: "ok" };
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});