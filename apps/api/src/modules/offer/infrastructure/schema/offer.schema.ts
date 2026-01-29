import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { businesses } from 'src/modules/bussiness/infrastructure/schema/business.schema';
export const offers = pgTable('offers', {
  offer_id: uuid('offer_id').primaryKey().defaultRandom(),

  description: text('description').notNull(),

  offerCode: text('offer_code').notNull(),

  offerTitle: text('offer_title').notNull(),

  discountPercentage: integer('discount_percentage').notNull(),

  validUpTo: timestamp('valid_up_to', { withTimezone: true }).notNull(),

  redeemamountForGetTheOffer: integer(
    'redeem_amount_for_get_the_offer',
  ).notNull(),

  bussinessId: uuid('bussiness_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
