import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        const userQuery = await prisma.user.findUnique({
            where: { id: userId },
        });

        const monthlyBalance = await prisma.monthlyBalanceHour.findFirst({
            where: {
                AND: [
                    { date: { gte: body.dateStart } },
                    { userId: userId },
                ],
            },
        });

        if (monthlyBalance) {
            throw createError({
                statusCode: 400,
                message: `Já existe fechamento de horas para o usuario nesse período. Data do banco de horas: ${monthlyBalance.date}`,
            });
        }

        const dateStart = new Date(`${body.dateStart}T00:00:00`);
        const dateEnd = new Date(`${body.dateEnd}T23:59:59`);

        if (userQuery && userQuery.daysWeek) {
            const week = JSON.parse(userQuery.daysWeek);
            return await insertUserDaysMonthFromJson(userId, week, dateStart, dateEnd);
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            message: e.message,
        });
    }

});


async function insertUserDaysMonthFromJson(userID: number, week: any, dateFirst: Date, dateLast: Date): Promise<any> {
    const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    try {
        await prisma.workHour.deleteMany({
            where: {
                AND: [
                    { date: { gte: dateFirst.toISOString().split("T")[0] } },
                    { date: { lte: dateLast.toISOString().split("T")[0] } },
                    { userId: userID },
                ],
            },
        });

        const promises:any = [];
        for (let day = dateFirst; day <= dateLast; day.setDate(day.getDate() + 1)) {
            const dayOfWeek = daysOfWeek[day.getDay()];
            if (dayOfWeek !== undefined && week[dayOfWeek] && week[dayOfWeek].length) {
                const formattedDate: string = day.toISOString().split('T')[0] ?? '';
                week[dayOfWeek].forEach(async (hour: any) => {
                    promises.push(
                        prisma.workHour.create({
                            data: {
                                date: formattedDate,
                                userId: userID,
                                entryTime: hour.entryTime,
                                departureTime: hour.departureTime,
                            },
                        })
                    )
                });
            }
        }
        await Promise.all(promises);
        return { message: 'Horas geradas com sucesso!' };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            message: e.message,
        });
    }
}