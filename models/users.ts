import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey(),
    nome: text("name"),
    email: text("email"),
    login: text("login"),
    password: text("password"),
    role: text('role', { enum: ['admin', 'funcionario'] }),
    status: integer('status', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});