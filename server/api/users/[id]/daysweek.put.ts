import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        const update = await prisma.user.update({
            where: { id: userId },
            data: {
                daysWeek: JSON.stringify(body),
            },
        });
        if (update) {
            return true;
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});