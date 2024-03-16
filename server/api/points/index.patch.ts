import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq, and, isNull } from "drizzle-orm";
import { saveUserImage } from '../../../utils/utils';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    const formattedTime = `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;

    const pointQuery = db.select()
      .from(points)
      .where(
        and(eq(points.userId, body.userId), isNull(points.departureDate))
      )
      .get()

    const nameImage = saveUserImage(body.userId, body.capturedImage)

    const data: any = {
      userId: body.userId,
      observation: body.observation,
    }

    if (!pointQuery) {
      data.entryExpressio = body.expressio
      data.entryDate = formattedDate
      data.entryTime = formattedTime
      data.entryImage = nameImage
    } else {
      data.departureExpressio = body.expressio
      data.departureDate = formattedDate
      data.departureTime = formattedTime
      data.departureImage = nameImage
    }

    if (pointQuery) {
      return db.update(points).set(data).where(eq(points.id, pointQuery.id)).run()
    } else {
      return db.insert(points).values(data).run();
    }

  } catch (e: any) {
    console.log(e)
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});