import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    if (!body.date) {
      throw createError({
        status: 400,
        message: "workDayId is required",
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
        setResponseStatus(event, 400)
        return { workHour: workHour, message: "Já existe esse horario para esse funcionario" };
      }
      if ((body.entryTime < workHour.departureTime && body.departureTime > workHour.entryTime)) {
        setResponseStatus(event, 400)
        return { workHour: workHour, message: "Existe e há um choque de horário com esse dados digitado." };
      }
    }
    // Create workHour
    const workHourCreted = await prisma.workHour.create({
      data: {
        userId: body.userId,
        date: body.date,
        entryTime: body.entryTime,
        departureTime: body.departureTime,
      },
    });
    if (workHourCreted) {
      setResponseStatus(event, 201)
      return { workHour: workHourCreted };
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});