import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
        await prisma.workHour.delete({
            where: { id: id }
        });
        return { message: "Horario deletado com sucesso!" };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }

});