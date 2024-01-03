import { users } from "../../../models/users";
import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);
        let userQuery = db.select()
            .from(users)
            .where(eq(users.id, userId))
            .get()

        userQuery.password = null;

        const pointQuery = db.select()
            .from(points)
            .where(
                and(eq(points.userId, userId), isNull(points.departureDate))
            )
            .get()

        return { user: userQuery, point: pointQuery };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});