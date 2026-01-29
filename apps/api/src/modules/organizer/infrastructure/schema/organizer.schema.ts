import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const organizers = pgTable('organizers', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: text('name').notNull(),

  description: text('description').notNull(),

  email: text('email').notNull(),

  accountNumber: text('accountNumber').notNull(),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Organizer = typeof organizers.$inferSelect;
export type NewOrganizer = typeof organizers.$inferInsert;
