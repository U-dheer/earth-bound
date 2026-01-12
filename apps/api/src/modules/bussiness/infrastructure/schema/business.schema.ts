import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const businesses = pgTable('businesses', {
  bussiness_id: uuid('bussiness_id').primaryKey().defaultRandom(),

  name: text('name').notNull(),

  address: text('address').notNull(),

  city: text('city').notNull(),

  description: text('description').notNull(),

  phone_number: text('phone_number').notNull(),

  email: text('email').notNull(),

  created_at: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
