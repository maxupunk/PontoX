import { users } from "../../../models/users";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event)
        delete body.id;
        return db.update(users)
            .set(body)
            .where(eq(users.id, userId))
            .run()
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});