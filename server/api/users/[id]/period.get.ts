import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = getRouterParam(event, 'id')
        if (!id) {
            return
        }
        const userId = Number(id);
        const query = getQuery(event)
        const dateStart = query.dateStart ? String(query.dateStart) : new Date().toString().split("T")[0];
        const dateEnd = query.dateEnd ? String(query.dateEnd) : new Date().toString().split("T")[0];
        const userQuery = await prisma.workHour.findMany({
            where: {
                AND: [
                    { date: { gte: dateStart } },
                    { date: { lte: dateEnd } },
                    { userId: userId },
                ],
            },
        });
        return userQuery
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});