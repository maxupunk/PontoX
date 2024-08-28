import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
    try {
        const id = Number(event.context.params?.id);
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