import { points } from "../../../models/points";
import { users } from "../../../models/users";
import { db } from "../../sqlite-service";
import { and, eq, between, sql } from "drizzle-orm";

export default defineEventHandler(async (event:any) => {
  let body = await readBody(event)
  const id:number = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User id is required',
    });
  }
  const ResumoQuery = db.select({
    entryDate: points.entryDate,
    totalMinutes: sql<number>`SUM((strftime('%s', ${points.departureTime}) - strftime('%s', ${points.entryTime})) / 60) as totalHoursWorked`,
  }).from(points)
    .leftJoin(users, eq(users.id, points.userId))
    .where(and(between(points.entryDate, body.entryDateStart, body.entryDateEnd), eq(users.id, id)))
    .groupBy(points.entryDate)
    .all();

  const labels = ResumoQuery.map((item: any) => item.entryDate);
  const data = ResumoQuery.map((item: any) => `${Math.floor(item.totalMinutes / 60)}.${item.totalMinutes % 60}`);
  const result = {
    labels: labels,
    data: data
  };
  return result;
});