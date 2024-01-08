import { points } from "../../../models/points";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    try {
        const pointId = Number(event.context.params?.id);
        let body = await readBody(event)
        const data: any = {
            userId: body.userId,
            entryDate: body.entryDate,
            entryImage: body.entryImage,
            departureDate: body.departureDate,
            departureImage: body.departureImage,
            observation: body.observation,
        }
        return db.update(points)
            .set(data)
            .where(eq(points.id, pointId))
            .run()
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});