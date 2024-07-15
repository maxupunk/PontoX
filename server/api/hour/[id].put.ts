import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const hourId = Number(event.context.params?.id);
        let body = await readBody(event);
        return prisma.workHour.update({
            where: { id: hourId },
            data: {
                entryTime: body.entryTime,
                departureTime: body.departureTime,
            },
        });
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});