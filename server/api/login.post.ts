import { users } from "../../models/users";
import { db } from "../sqlite-service";
import { eq } from "drizzle-orm";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event)
    const userQuery = db.select()
      .from(users)
      .where(eq(users.login, body.login))
      .get()

    if (userQuery) {
      const passwordDB = (userQuery.password) ? userQuery.password : '';
      try {
        const result = await bcrypt.compare(body.password, passwordDB);
        if (result) {
          const data = {
            token: crypto.randomBytes(24).toString('hex'),
          }
          db.update(users)
            .set(data)
            .where(eq(users.id, userQuery.id))
            .run()
          return data;
        } else {
          return false;
        }
      } catch (err) {
        return err;
      }
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: e.message,
    });
  }
});