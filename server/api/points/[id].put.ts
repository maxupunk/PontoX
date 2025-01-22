import prisma from "~~/server/prisma";
import { pointShowResource } from '~~/server/resources/point';

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);
        let body = await readBody(event);

        const point = await prisma.point.update({
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
            include: {
                user: true
            },
        });

        return {
            data: pointShowResource(point),
            message: 'Ponto atualizado com sucesso'
        };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});