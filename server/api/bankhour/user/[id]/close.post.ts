import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const UserId: number = Number(event.context.params?.id);
        let { date } = await readBody(event);

        const inputDateCompare = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);
        const currentDateCompare = new Date().setHours(0, 0, 0, 0);

        if (date && inputDateCompare > currentDateCompare) {
            throw createError({
                status: 400,
                message: 'A data não pode ser maior que a data atual!',
            });
        }

        const currentDate = new Date().toISOString().split('T')[0];
        // Update date handling to ensure string type
        const inputDate = (date ?? currentDate).toString();

        const bankHour = await prisma.bankHour.findFirst({
            where: {
                userId: UserId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (bankHour && new Date(bankHour.date).setHours(0, 0, 0, 0) >= new Date(inputDate).setHours(0, 0, 0, 0)) {
            throw createError({
                status: 400,
                message: 'Já foi fechado o banco de horas até esse data!',
            });
        }

        const point = await prisma.point.findFirst({
            where: {
                userId: UserId,
                entryDate: {
                    lte: inputDate,
                },
                departureDate: null,
            },
        });

        if (point) {
            throw createError({
                status: 400,
                message: 'Não é possivel fechar o banco de horas, pois ainda existe um ponto em aberto!',
            });
        }

        const DateStart: any = bankHour?.date ? bankHour.date : currentDate;
        const DateEnd: any = inputDate;
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

        const pointTotal = points.reduce((acc, point) => {
            const entryDateTime = new Date(`${point.entryDate}T${point.entryTime}`);
            const departureDateTime = new Date(`${point.departureDate}T${point.departureTime}`);
            const totalWorkTime = (departureDateTime.getTime() - entryDateTime.getTime());
            return acc + totalWorkTime;
        }, 0);

        const WorkHours = await prisma.workHour.findMany({
            where: {
                userId: UserId,
                date: {
                    gte: DateStart, // maior ou igual a dataInicial
                    lte: DateEnd,  // menor ou igual a dataFinal
                },
            },
        });

        const WorkHoursTotal = WorkHours.reduce((acc, workHour) => {
            const entryTime = new Date(`${workHour.date}T${workHour.entryTime}`);
            const departureTime = new Date(`${workHour.date}T${workHour.departureTime}`);
            const totalWorkTime = (departureTime.getTime() - entryTime.getTime());
            return acc + totalWorkTime;
        }, 0);

        const TotalInMinutes = (pointTotal - WorkHoursTotal) / 60000;

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