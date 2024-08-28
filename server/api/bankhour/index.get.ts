import prisma from "~~/server/prisma";

export default defineEventHandler(async () => {
    try {
        const bankHour = await prisma.bankHour.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        return bankHour;

    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});