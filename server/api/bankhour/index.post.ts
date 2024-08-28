import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);
    const HourCreted = await prisma.bankHour.create({
      data: {
        userId: body.userId,
        minute: body.minute,
        date: body.date,
        observation: body.observation ? body.observation : null,
      },
    });
    if (HourCreted) {
      setResponseStatus(event, 201)
      return { message: "Hora adicionado com sucesso" };
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});