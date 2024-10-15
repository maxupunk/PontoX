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
            include: {
                WorkHours: true,
            },
        });

        const pointTotalMinutes = points.reduce((acc, point) => {
            const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
            const departureDateTime = new Date(`${point.departureDate}T${point.departureTime}`);
            const totalWorkTime = (departureDateTime.getTime() - entryDateTime.getTime());

            let resultTotalTime = 0;
            if (point.WorkHours) {
                const WorkHoursEntryTime = new Date(`${point.entryDate}T${point.WorkHours.entryTime}`);
                const WorkHoursDepartureTime = new Date(`${point.departureDate}T${point.WorkHours.departureTime}`);
                const WorkHoursTotalTime = (WorkHoursDepartureTime.getTime() - WorkHoursEntryTime.getTime());
                resultTotalTime = totalWorkTime - WorkHoursTotalTime;
            } else {
                resultTotalTime = totalWorkTime;
            }

            return acc + resultTotalTime;
        }, 0);

        const TotalInMinutes = pointTotalMinutes / 60000;

        await prisma.bankHour.create({
            data: {
                userId: UserId,
                minute: Math.floor(TotalInMinutes),
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