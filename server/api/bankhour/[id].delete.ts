import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
        const bankHour = await prisma.bankHour.findUnique({
            where: { id: id }
        });
        if (!bankHour) {
            throw createError({
                status: 404,
                message: "Hora não encontrada."
            });
        }

        const bankHourLatest = await prisma.bankHour.findMany({
            orderBy: {
                id: 'desc',
            },
            take: 1,
            where: { userId: bankHour.userId }
        });
        if (bankHourLatest[0] && bankHourLatest[0].id !== id) {
            throw createError({
                status: 400,
                message: "Não é possível deletar uma hora que não é a última."
            });
        }
        await prisma.bankHour.delete({
            where: { id: id }
        });
        return { message: "Hora deletada." };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});