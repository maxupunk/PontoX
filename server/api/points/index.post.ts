import prisma from "~~/server/prisma";
import { saveUserImage } from '~~/server/utils/image';
import joi from 'joi';
import { messages } from 'joi-translation-pt-br';
import { pointShowResource } from '~~/server/resources/point';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);

    // validate body
    const schema = joi.object({
      userId: joi.required().label("o nome do usuário"),
      entryDate: joi.date().required().label("a data de entrada"),
      entryTime: joi.string().required().label("a hora de entrada"),
      departureDate: joi.date().label("a data de saída"),
      departureTime: joi.string().label("a imagem de saída"),
      observation: joi.string(),
    }).unknown(true)

    const { error } = schema.validate(body, { messages })

    if (error) {
      throw createError({
        status: 400,
        message: error.message,
      });
    }
    /////////////////////////////////////////////////

    const tenantId = event.context.auth.tenantId;

    if (body.entryImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.entryImage = saveUserImage(tenantId, body.userId, body.entryImage);
    }

    if (body.departureImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.departureImage = saveUserImage(tenantId, body.userId, body.departureImage);
    }

    const data: any = {
      userId: body.userId,
      entryDate: body.entryDate,
      entryTime: body.entryTime,
      entryImage: body.entryImage,
      entryExpressio: '',
      departureDate: body.departureDate,
      departureTime: body.departureTime,
      departureImage: body.departureImage,
      departureExpressio: '',
      observation: body.observation,
    };

    const newPoint = await prisma.point.create({
      data: data,
      include: {
        user: true
      },
    });

    return {
      data: pointShowResource(newPoint),
      message: 'Ponto registrado com sucesso'
    };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});