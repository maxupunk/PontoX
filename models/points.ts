import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const points = sqliteTable('points', {
    id: integer('id').primaryKey(),
    userId: integer('user_id'),
    entryDate: text('entry_date').notNull().default(sql`CURRENT_TIMESTAMP`),
    departureDate: text('departure_date'),
    imageInfo: text('image_info'),
    observation: text('observation'),
});