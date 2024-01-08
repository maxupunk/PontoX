import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { saveUserImage } from '../../../utils/imageUtils';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event)

    if (body.entryImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.entryImage = saveUserImage(body.userId, body.entryImage)
    }

    if (body.departureImage) {
      // save file in public/imagens/userId if it is a base64 image
      body.departureImage = saveUserImage(body.userId, body.departureImage)
    }

    const data: any = {
      userId: body.userId,
      entryDate: body.entryDate,
      entryImage: body.entryImage,
      departureDate: body.departureDate,
      departureImage: body.departureImage,
      observation: body.observation,
    }
    return db.insert(points).values(data).run();
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});