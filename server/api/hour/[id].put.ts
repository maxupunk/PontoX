import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const hourId = Number(event.context.params?.id);
        let body = await readBody(event);
        const hourConsult = await prisma.workHour.findFirst({
            where: { id: hourId },
            include: {
                workDay: {
                    include: {
                        workHours: true,
                    },
                },
            },
        })
        if (hourConsult && hourConsult.workDay) {
            for (let workHour of hourConsult.workDay.workHours) {
                if (workHour.id === hourId) continue;
                if (workHour.entryTime === body.entryTime && workHour.departureTime === body.departureTime) {
                    return { workHour: workHour, message: "Já existe esse horario para esse funcionario" };
                }
                if ((body.entryTime < workHour.departureTime && body.departureTime > workHour.entryTime)) {
                    return { workHour: workHour, message: "Existe um choque de horário com esse horario." };
                }
            }
        }
        return prisma.workHour.update({
            where: { id: hourId },
            data: {
                entryTime: body.entryTime,
                departureTime: body.departureTime,
            },
        });
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});