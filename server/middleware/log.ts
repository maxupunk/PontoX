import fs from 'fs'
import path from 'path'
import { users } from "../../models/users";
import { db } from "../sqlite-service";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  console.log('Log request: ' + getRequestURL(event))
  if (event.method !== 'GET') {
    const authorization = event.headers.get('authorization');
    const userQuery = db.select()
      .from(users)
      .where(eq(users.token, authorization))
      .get()

    const body = await readBody(event)
    const logbody = `${event.method} - ${event.path} - usar: ${userQuery?.name}\n${JSON.stringify(body)}`

    const date = new Date();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    // Convert data to JSON string
    const dataString = `${hour}:${minute}:${second}\n${logbody}\n`;
    // Create a directory path
    const dir = './logs';
    // Check if directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const dateString = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()} `;
    const filename = path.resolve(dir, `${dateString}.log`);
    // Write the data to a file
    fs.appendFileSync(filename, dataString);
  }
})