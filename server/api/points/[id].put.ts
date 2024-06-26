import prisma from "../../prisma";

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);
        let body = await readBody(event);
        const updatedPoint = await prisma.points.update({
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
        return updatedPoint;
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});