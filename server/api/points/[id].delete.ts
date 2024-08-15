import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
        const point = await prisma.point.findUnique({
            where: { id: id },
        });
        if (!point) {
            throw createError({
                statusCode: 404,
                statusMessage: "O ponto não foi encontrado",
            });
        }

        const monthlyBalance = await prisma.monthlyBalanceHour.findFirst({
            where: {
                AND: [
                    { date: { lte: point.entryDate } },
                    { userId: point.userId },
                ],
            },
        });

        if (monthlyBalance) {
            throw createError({
                statusCode: 400,
                message: `Não é possível deletar um ponto que já foi fechado. Data do banco de horas: ${monthlyBalance.date}`,
            });
        }

        await prisma.point.delete({
            where: { id: id }
        });

        return { message: "Ponto deletado com sucesso!" };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});