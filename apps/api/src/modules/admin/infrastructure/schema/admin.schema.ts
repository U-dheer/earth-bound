import { pgTable, uuid, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(), // uses gen_random_uuid()

  email: text('email').notNull(),

  mainAccountNumber: text('main_account_number').notNull(),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
