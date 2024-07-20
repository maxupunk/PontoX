import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        const userQuery = await prisma.user.findUnique({
            where: { id: userId },
        });

        const dateStart = new Date(`${body.dateStart}T00:00:00`);
        const dateEnd = new Date(`${body.dateEnd}T23:59:59`);

        if (userQuery && userQuery.daysWeek) {
            const week = JSON.parse(userQuery.daysWeek);
            return insertUserDaysMonthFromJson(userId, week, dateStart, dateEnd)
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});


async function insertUserDaysMonthFromJson(userID: number, week: any, dateFirst: Date, dateLast: Date) {
    const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    await prisma.workDay.deleteMany({
        where: {
            AND: [
                { date: { gte: dateFirst.toString().split("T")[0] } },
                { date: { lte: dateLast.toString().split("T")[0] } },
                { userId: userID },
            ],
        },
    });

    for (let day = dateFirst; day <= dateLast; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = daysOfWeek[day.getDay()];
        if (week[dayOfWeek].length) {
            const formattedDate: string = day.toString().split('T')[0];
            await prisma.workDay.upsert({
                where: {
                    date_userId: {
                        date: formattedDate,
                        userId: userID,
                    }
                },
                update: {},
                create: {
                    date: formattedDate,
                    userId: userID,
                    workHours: {
                        createMany: {
                            data: week[dayOfWeek],
                        },
                    }
                },
            });
        }
    }
    return true;
}