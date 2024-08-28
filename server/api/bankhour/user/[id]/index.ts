import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id: number = Number(event.context.params?.id);

        const hourTotal = await prisma.bankHour.aggregate({
            where: {
                userId: id,
            },
            _sum: {
                minute: true,
            },
        });

        const bankHour = await prisma.bankHour.findMany({
            where: {
                userId: id,
            },
            orderBy: {
                date: 'asc'
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                name: true,
            },
        });

        return {
            user: user,
            rows: bankHour,
            total: hourTotal._sum.minute,
        };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});