import { users } from "../../../models/users";
import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    const pontsResp = db.select({
      id: points.id,
      name: users.name,
      entryDate: points.entryDate,
      departureDate: points.departureDate,
    }).from(points)
      .leftJoin(users, eq(users.id, points.userId))
      .all();
    return { points: pontsResp }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});