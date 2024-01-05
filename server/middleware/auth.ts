import { users } from "../../models/users";
import { db } from "../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler((event) => {
  console.log(event.path);
  if (event.method !== 'GET' && event.path !== '/api/login') {
    let authorization = event.headers.get('authorization');
    if (authorization) {
      const userQuery = db.select()
        .from(users)
        .where(eq(users.token, authorization))
        .get()

      if (!userQuery) {
        return 'Unauthorized'
      }

    } else {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
  }
})