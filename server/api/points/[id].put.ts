import prisma from "~~/server/prisma";
import { pointShowResource } from '~~/server/resources/point';
import joi from 'joi';
import { messages } from 'joi-translation-pt-br';

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id)
        let body = await readBody(event)

        // validate body
        const schema = joi.object({
            userId: joi.required().label("o nome do usuário"),
            entryDate: joi.date().required().label("a data de entrada"),
            entryTime: joi.string().required().label("a hora de entrada"),
            departureDate: joi.date().allow(null).label("a data de saída"),
            departureTime: joi.string().allow(null).label("a imagem de saída")
        }).unknown(true)

        const { error } = schema.validate(body, { messages })

        if (error) {
            throw createError({
                status: 400,
                message: error.message,
            })
        }
        /////////////////////////////////////////////////

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
        })

        return {
            data: pointShowResource(point),
            message: 'Ponto atualizado com sucesso'
        };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        })
    }
});