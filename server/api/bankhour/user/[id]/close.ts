import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const UserId: number = Number(event.context.params?.id);

        const bankHour = await prisma.bankHour.findFirst({
            where: {
                userId: UserId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (bankHour?.date === new Date().toISOString().split('T')[0]) {
            throw createError({
                status: 400,
                message: 'Já foi fechado o banco de horas com a data de hoje!',
            });
        }

        const DateStart: any = bankHour?.date ? bankHour.date : new Date().toISOString().split('T')[0];
        const DateEnd: any = new Date().toISOString().split('T')[0];
        const points = await prisma.point.findMany({
            where: {
                userId: UserId,
                entryDate: {
                    gte: DateStart, // maior ou igual a dataInicial
                },
                departureDate: {
                    lte: DateEnd,  // menor ou igual a dataFinal
                }
            },
        });

        const pointTotalMinutes = points.reduce((acc, point) => {
            const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
            const departureDateTime = new Date(`${point.departureDate}T${point.departureTime}`);
            const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
            return acc + totalTimeMinutes;
        }, 0);

        await prisma.bankHour.create({
            data: {
                userId: UserId,
                minute: Math.floor(pointTotalMinutes),
                date: DateEnd,
                observation: null,
            },
        });

        return {
            message: 'Banco de horas fechado com sucesso',
        };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});