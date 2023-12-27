import { users } from "../../models/users";
import { db } from "../sqlite-service";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    return db.insert(users).values(body).run();
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});