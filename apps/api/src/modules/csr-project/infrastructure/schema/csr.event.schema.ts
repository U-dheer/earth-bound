import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const csrEvents = pgTable('csr_events', {
  id: uuid('id').primaryKey().defaultRandom(), // gen_random_uuid()

  name: text('name').notNull(),

  description: text('description').notNull(),

  startDate: timestamp('start_date', { withTimezone: false }).notNull(),

  endDate: timestamp('end_date', { withTimezone: false }).notNull(),

  /**
   * Stored as JSONB: [longitude, latitude]
   * Example: [80.7718, 7.8731]
   */
  location: jsonb('location').$type<[number, number] | null>(),

  isApproved: boolean('is_approved').notNull().default(false),

  /**
   * Organizer metadata
   * Example: { name: "ABC Org", contact: "0771234567" }
   */
  organizer: jsonb('organizer').$type<Record<string, unknown> | null>(),

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
