import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id: number = Number(event.context.params?.id);

        const bankHour = await prisma.bankHour.findUnique({
            where: {
                id: id,
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