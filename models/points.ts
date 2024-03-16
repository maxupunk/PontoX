import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const points = sqliteTable('points', {
    id: integer('id').primaryKey(),
    userId: integer('user_id'),
    entryDate: text('entry_date').notNull().default(sql`CURRENT_DATE`),
    entryTime: text('entry_time').default(sql`CURRENT_TIME`),
    entryExpressio: text('entry_expressio'),
    entryImage: text('entry_image'),
    departureDate: text('departure_date'),
    departureTime: text('departure_time'),
    departureExpressio: text('departure_expressio'),
    departureImage: text('departure_image'),
    observation: text('observation'),
});