import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const hourId = Number(event.context.params?.id);
        let body = await readBody(event);
        if (!body.date) {
            throw createError({
                statusCode: 400,
                statusMessage: "date é requerida",
            });
        }

        const workHour = await prisma.workHour.findFirst({
            where: {
                id: hourId ,
            },
        })

        if (!workHour) {
            throw createError({
                statusCode: 400,
                statusMessage: "Horario não encontrado",
            });
        }

        const workHours = await prisma.workHour.findMany({
            where: {
                date: body.date,
                userId: workHour.userId
            },
        })
        if (workHours) {
            for (const workHour of workHours) {
                if (workHour.entryTime === body.entryTime && workHour.departureTime === body.departureTime && workHour.id !== hourId) {
                    return { workHour: workHour, message: "Já existe esse horario para esse funcionario" };
                }
                if ((body.entryTime < workHour.departureTime && body.departureTime > workHour.entryTime) && workHour.id !== hourId) {
                    return { workHour: workHour, message: "Existe um choque de horário com esse horario." };
                }
            }
        }
        await prisma.workHour.update({
            where: { id: hourId },
            data: {
                entryTime: body.entryTime,
                departureTime: body.departureTime,
            },
        });

        return { message: 'Horario atualizado com sucesso' };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});