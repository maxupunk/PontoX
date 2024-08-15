import prisma from "~~/server/prisma";
import { saveUserImage } from '~~/server/utils/image';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    const formattedTime = `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;

    const pointQuery = await prisma.point.findFirst({
      where: {
        userId: body.userId,
        departureDate: null,
      },
    });

    const nameImage = saveUserImage(body.userId, body.capturedImage);

    let data: any = {
      userId: body.userId,
      observation: body.observation,
    };

    if (!pointQuery) {
      data.entryExpressio = body.expressio;
      data.entryDate = formattedDate;
      data.entryTime = formattedTime;
      data.entryImage = nameImage;
      data.workHourId = body.workHourId;

      await prisma.point.create({
        data: data,
      });
    } else {
      data.departureDate = formattedDate;
      data.departureTime = formattedTime;
      data.departureImage = nameImage;

      await prisma.point.update({
        where: {
          id: pointQuery.id,
        },
        data: data,
      });
    }
    return { message: 'Ponto registrado com sucesso!' };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});