import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        await prisma.user.update({
            where: { id: userId },
            data: {
                daysWeek: JSON.stringify(body),
            },
        });
        return { message: 'Horário semanal atualizado com sucesso!' };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});