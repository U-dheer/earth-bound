import { pgTable, uuid, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { businesses } from 'src/modules/bussiness/infrastructure/schema/business.schema';
export const offers = pgTable('offers', {
  offer_id: uuid('offer_id').primaryKey().defaultRandom(),

  description: text('description').notNull(),

  offerCode: text('offer_code').notNull(),

  offerTitle: text('offer_title').notNull(),

  discountPercentage: serial('discount_percentage').notNull(),

  bussinessId: uuid('bussiness_id')
    .notNull()
    .references(() => businesses.bussiness_id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
