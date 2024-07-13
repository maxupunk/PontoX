import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        const userQuery = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (userQuery && userQuery.daysWeek) {
            const week = JSON.parse(userQuery.daysWeek);
            insertUserDaysMonthFromJson(userId, week, body.dateStart, body.dateEnd)
        }
        return { message: 'success' };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});


async function insertUserDaysMonthFromJson(userID: number, week: any, dateFirst: Date, dateLast: Date) {
    const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    const firstDayOfMonth = new Date(dateFirst);
    const lastDayOfMonth = new Date(dateLast);

    for (let day = firstDayOfMonth; day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = daysOfWeek[day.getDay()];
        if (week[dayOfWeek].length) {
            const formattedDate: string = day.toISOString().split('T')[0];
            const workerDay = await prisma.workDay.upsert({
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
                },
            });
            console.log("week", week[dayOfWeek]);
            const workHours = await prisma.workHour.createManyAndReturn({
                data: week[dayOfWeek],
            });
            console.log("workhours", workHours);
            for (const workHour of workHours) {
                await prisma.workDayWorkHour.create({
                    data: {
                        workDayId: workerDay.id,
                        workHourId: workHour.id,
                    },
                });
            }
        }
    }
}