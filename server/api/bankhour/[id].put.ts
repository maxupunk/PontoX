import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const hourId = Number(event.context.params?.id);
        let body = await readBody(event);

        const bankHour = await prisma.bankHour.findFirst({
            where: {
                id: hourId,
            },
        })

        if (!bankHour) {
            throw createError({
                status: 400,
                message: "banco de horas não encontrado",
            });
        }
        await prisma.bankHour.update({
            where: { id: hourId },
            data: {
                date: body.date,
                minute: body.minute,
                observation: body.observation,
            },
        });

        return { message: "Dados atualizado com sucesso!" };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});