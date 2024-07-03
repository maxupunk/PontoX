import prisma from "~/server/prisma";

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);

        const pointQuery = await prisma.point.findUnique({
            where: { id: pointId },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!pointQuery) {
            throw createError({
                statusCode: 404,
                statusMessage: "Point not found",
            });
        }

        return {
            point: {
                id: pointQuery.id,
                userId: pointQuery.userId,
                name: pointQuery.user?.name,
                entryDate: pointQuery.entryDate,
                entryTime: pointQuery.entryTime,
                entryExpressio: pointQuery.entryExpressio,
                entryImage: pointQuery.entryImage,
                departureDate: pointQuery.departureDate,
                departureTime: pointQuery.departureTime,
                departureExpressio: pointQuery.departureExpressio,
                departureImage: pointQuery.departureImage,
                observation: pointQuery.observation,
            },
        };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});