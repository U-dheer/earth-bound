import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { offers } from 'src/modules/offer/infrastructure/schema/offer.schema';
import { users } from 'src/modules/user/infrastructure/schema/user.schema';

export const UserOffers = pgTable('user_offers', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  offerId: uuid('offer_id')
    .notNull()
    .references(() => offers.offer_id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type UserOffer = typeof UserOffers.$inferSelect;
export type NewUserOffer = typeof UserOffers.$inferInsert;
