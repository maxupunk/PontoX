import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);
        let body = await readBody(event);
        await prisma.point.update({
            where: { id: pointId },
            data: {
                userId: body.userId,
                entryDate: body.entryDate,
                entryTime: body.entryTime,
                entryImage: body.entryImage,
                departureDate: body.departureDate,
                departureTime: body.departureTime,
                departureImage: body.departureImage,
                observation: body.observation,
            },
        });
        return { message: 'Ponto atualizado com sucesso' };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});