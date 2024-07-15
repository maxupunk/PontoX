import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
        return await prisma.workHour.findUnique({
            where: { id: id },
            include: {
                workDay: {
                    select: {
                        date: true,
                        userId: true
                    }
                }
            }
        });
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});