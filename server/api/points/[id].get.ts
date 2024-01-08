import { users } from "../../../models/users";
import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);
        let pointsQuery = db.select({
            id: points.id,
            userId: points.userId,
            name: users.name,
            entryDate: points.entryDate,
            entryExpressio: points.entryExpressio,
            entryImage: points.entryImage,
            departureDate: points.departureDate,
            departureExpressio: points.departureExpressio,
            departureImage: points.departureImage,
            observation: points.observation,
        })
            .from(points)
            .leftJoin(users, eq(users.id, points.userId))
            .where(eq(points.id, pointId))
            .get()

        return { point: pointsQuery };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});