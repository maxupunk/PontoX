import prisma from "~~/server/prisma";
import { saveUserImage } from '~~/server/utils/image';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event);

    if (body.entryImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.entryImage = await saveUserImage(body.userId, body.entryImage);
    }

    if (body.departureImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.departureImage = await saveUserImage(body.userId, body.departureImage);
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

    await prisma.point.create({
      data: data,
    });

    return { message: 'Ponto registrado com sucesso' };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});