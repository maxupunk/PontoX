import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);

        const userQuery = await prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                login: true,
                rule: true,
                status: true,
            },
            where: { id: userId },
        });

        const pointQuery = await prisma.point.findFirst({
            where: {
                userId: userId,
                departureDate: null,
            },
        });

        const date = new Date();
        const workHour = await prisma.workHour.findMany({
            where: {
                userId: userId,
                date: date.toISOString().split('T')[0],
            },
        });

        return { user: userQuery, point: pointQuery, workHour: workHour };
    } catch (e: any) {
        return {
            status: 400,
            message: e.message,
        };
    }
});