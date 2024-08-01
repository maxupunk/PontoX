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
                WorkHours: {
                    select: {
                        id: true,
                        date: true,
                        entryTime: true,
                        departureTime: true,
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

        return pointQuery;
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});