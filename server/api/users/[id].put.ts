import { users } from "../../../models/users";
import { db } from "../../sqlite-service";
import { eq } from "drizzle-orm";
import { saveUserImage } from '../../../utils/imageUtils';
import bcrypt from 'bcrypt'; 

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event)
        if (body.capturedImage) {
            return saveUserImage(userId, body.capturedImage)
        } else {
            if (body.id) delete body.id;

            if (body.password) {
                const password = body.password;
                const hashedPassword = await bcrypt.hash(password, 10);
                body.password = hashedPassword;
            } else {
                delete body.password;
            }

            return db.update(users)
                .set(body)
                .where(eq(users.id, userId))
                .run()
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});