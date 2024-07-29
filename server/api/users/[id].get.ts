import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);

        const userQuery = await prisma.user.findUnique({
            where: { id: userId },
        });

        const userDate = {
            id: userQuery?.id,
            name: userQuery?.name,
            email: userQuery?.email,
            login: userQuery?.login,
            role: userQuery?.role,
            status: userQuery?.status,
        };

        const pointQuery = await prisma.point.findFirst({
            where: {
                userId: userId,
                departureDate: null,
            },
        });

        const date = new Date();
        const workDay = await prisma.workDay.findFirst({
            where: {
                userId: userId,
                date: date.toISOString().split('T')[0],
            },
            include: {
                workHours: true,
            },
        });

        return { user: userDate, point: pointQuery, workDay: workDay };
    } catch (e: any) {
        return {
            statusCode: 400,
            statusMessage: e.message,
        };
    }
});