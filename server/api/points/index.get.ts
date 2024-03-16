import { users } from "../../../models/users";
import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    const pontsResp = db.select({
      id: points.id,
      name: users.name,
      entryDate: points.entryDate,
      entryTime: points.entryTime,
      departureDate: points.departureDate,
      departureTime: points.departureTime,
    }).from(points)
      .leftJoin(users, eq(users.id, points.userId))
      .orderBy(desc(points.id))
      .all();
    return { points: pontsResp }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});