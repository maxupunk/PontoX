import { points } from "../../../models/points";
import { users } from "../../../models/users";
import { db } from "../../sqlite-service";
import { eq, between, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event)
    const ResumoQuery = db.select({
      id: users.id,
      name: users.name,
      totalMinutes: sql<number>`SUM((strftime('%s', ${points.departureTime}) - strftime('%s', ${points.entryTime})) / 60) as totalHoursWorked`,
    }).from(points)
      .leftJoin(users, eq(users.id, points.userId))
      .where(between(points.entryDate, body.entryDateStart, body.entryDateEnd))
      .groupBy(users.id)
      .all();

    let Resulmo = ResumoQuery.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        hours: Math.floor(item.totalMinutes / 60),
        minuites: item.totalMinutes % 60
      }
    })

    return Resulmo;
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});