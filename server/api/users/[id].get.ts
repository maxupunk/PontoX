import { users } from "../../../models/users";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);
        const userQuery = db.select()
            .from(users)
            .where(eq(users.id, userId))
            .get()
            return { user: userQuery };
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});