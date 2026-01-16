import { pgTable, uuid, text, timestamp, serial } from 'drizzle-orm/pg-core';
import { csrEvents } from 'src/modules/csr-project/infrastructure/schema/csr.event.schema';
import { users } from 'src/modules/user/infrastructure/schema/user.schema';

export const donations = pgTable('donations', {
  donation_id: uuid('donation_id').primaryKey().defaultRandom(),

  amount: serial('amount').notNull(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  csrId: uuid('csr_id')
    .notNull()
    .references(() => csrEvents.id, { onDelete: 'cascade' }),

  donated_at: timestamp('donated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
