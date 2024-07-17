import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    if (!body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: "workDayId is required",
      });
    }
    const workDayConsult = await prisma.workDay.findFirst({
      where: {
        OR: [
          {
            id: body.workDayId,
          },
          {
            date: body.date,
            userId: body.userId,
          },
        ],
      },
      include: {
        workHours: true,
      },
    })
    let workDayID: number = 0;
    if (workDayConsult) {
      for (let workHour of workDayConsult.workHours) {
        if (workHour.entryTime === body.entryTime && workHour.departureTime === body.departureTime) {
          return { workHour: workHour, message: "Já existe esse horario para esse funcionario" };
        }
        if ((body.entryTime < workHour.departureTime && body.departureTime > workHour.entryTime)) {
          return { workHour: workHour, message: "Existe e há um choque de horário com esse dados digitado." };
        }
      }
      workDayID = workDayConsult.id;
    } else {
      const workDayCreted = await prisma.workDay.create({
        data: {
          date: body.date,
          userId: body.userId,
        }
      });
      workDayID = workDayCreted.id;
    }
    // Create workHour
    const workHourCreted = await prisma.workHour.create({
      data: {
        entryTime: body.entryTime,
        departureTime: body.departureTime,
        workDayId: workDayID,
      },
    });
    if (workHourCreted) {
      setResponseStatus(event, 201)
      return { workHour: workHourCreted, message: "ok"};
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});