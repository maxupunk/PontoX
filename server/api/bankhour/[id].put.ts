import prisma from "~~/server/prisma";
import joi from 'joi';
import { messages } from 'joi-translation-pt-br';

export default defineEventHandler(async (event) => {
    try {
        const hourId = Number(event.context.params?.id);
        let body = await readBody(event);

        // validate body
        const schema = joi.object({
            userId: joi.required().label("o nome do usuário"),
            minute: joi.number().required().label("o minuto"),
            date: joi.date().required().label("a data"),
        }).unknown(true)

        const { error } = schema.validate(body, { messages })

        if (error) {
            throw createError({
                status: 400,
                message: error.message,
            })
        }
        /////////////////////////////////////////////////

        const bankHour = await prisma.bankHour.findUnique({
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
        const bankHourUpdate = await prisma.bankHour.update({
            where: { id: hourId },
            data: {
                date: body.date,
                minute: body.minute,
                observation: body.observation,
            },
            include: {
                user: true
            },
        });

        return {
            data: bankHourUpdate,
            message: "Dados atualizado com sucesso!"
        };
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});