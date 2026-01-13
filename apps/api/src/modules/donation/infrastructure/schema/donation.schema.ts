import { pgTable, uuid, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const donations = pgTable('donations', {
  donation_id: uuid('donation_id').primaryKey().defaultRandom(),

  amount: serial('amount').notNull(),

  donated_at: timestamp('donated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
