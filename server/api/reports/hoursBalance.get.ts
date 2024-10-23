import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                BankHour: true,
            },
            where: {
                BankHour: {
                    some: {},
                },
            },
        });

        const usersWithTotalMinutes = users.map(user => {
            const totalMinutes = user.BankHour.reduce((sum, bankHour) => sum + bankHour.minute, 0);
            return {
                id: user.id,
                name: user.name,
                minute: totalMinutes
            };
        });
        
        return usersWithTotalMinutes;
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});