import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizers } from 'src/modules/organizer/infrastructure/schema/organizer.schema';

export const csrEvents = pgTable('csr_events', {
  id: uuid('id').primaryKey().defaultRandom(), // gen_random_uuid()

  name: text('name').notNull(),

  description: text('description').notNull(),

  startDate: timestamp('start_date', { withTimezone: false }).notNull(),

  endDate: timestamp('end_date', { withTimezone: false }).notNull(),

  location: jsonb('location').$type<[number, number] | null>(),

  isApproved: boolean('is_approved').notNull().default(false),

  organizer_id: uuid('organizer_id')
    .notNull()
    .references(() => organizers.organizer_id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type CsrEvent = typeof csrEvents.$inferSelect;
export type NewCsrEvent = typeof csrEvents.$inferInsert;
