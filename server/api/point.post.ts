import { points } from "../../models/points";
import { db } from "../sqlite-service";
import { eq, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;


    const pointQuery = db.select()
      .from(points)
      .where(
        and(eq(points.userId, body.user_id), isNull(points.departureDate))
        )
      .get()

    const data = {
      userId: body.user_id,
      observation: body.observation,
      departureDate: pointQuery ? formattedDate : null,
    }
    console.log(pointQuery)

    if (pointQuery) {
      return db.update(points).set(data).where(eq(points.id, pointQuery.id)).run()
    } else {
      return db.insert(points).values(data).run();
    }

  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});