import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
        return await prisma.workHour.findUnique({
            where: { id: id },
        });
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});