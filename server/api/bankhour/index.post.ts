import prisma from "~~/server/prisma";
import joi from 'joi';
import { messages } from 'joi-translation-pt-br';

export default defineEventHandler(async (event) => {
  try {
    const body: any = await readBody(event);

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

    const HourCreted = await prisma.bankHour.create({
      data: body,
      include: {
        user: true
      },
    });
    if (HourCreted) {
      setResponseStatus(event, 201)
      return {
        data: HourCreted,
        message: "Hora adicionado com sucesso"
      };
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});