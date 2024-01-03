import { users } from "../../models/users";
import { db } from "../sqlite-service";
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  try {
    let body = await readBody(event)
    const password = body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    body.password = hashedPassword;
    return db.insert(users).values(body).run();
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});