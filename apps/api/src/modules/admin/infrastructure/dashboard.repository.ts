import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { donations } from '../../donation/infrastructure/schema/donation.schema';
import { UserOffers } from '../../user_offers/infrastructure/schema/user_offer.schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class DashboardRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async getDonationsByDateRange(startDateStr: string, endDateStr: string) {
    const result = await this.db
      .select({
        date: sql<string>`TO_CHAR(${donations.donated_at}, 'YYYY-MM-DD')`.as(
          'date',
        ),
        total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`.as('total'),
      })
      .from(donations)
      .where(
        sql`DATE(${donations.donated_at}) >= ${startDateStr}::date AND DATE(${donations.donated_at}) <= ${endDateStr}::date`,
      )
      .groupBy(sql`TO_CHAR(${donations.donated_at}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${donations.donated_at}, 'YYYY-MM-DD')`);

    return result;
  }

  async getOfferRedemptionsByDateRange(
    startDateStr: string,
    endDateStr: string,
  ) {
    const result = await this.db
      .select({
        date: sql<string>`TO_CHAR(${UserOffers.createdAt}, 'YYYY-MM-DD')`.as(
          'date',
        ),
        total: sql<number>`COUNT(*)`.as('total'),
      })
      .from(UserOffers)
      .where(
        sql`DATE(${UserOffers.createdAt}) >= ${startDateStr}::date AND DATE(${UserOffers.createdAt}) <= ${endDateStr}::date`,
      )
      .groupBy(sql`TO_CHAR(${UserOffers.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${UserOffers.createdAt}, 'YYYY-MM-DD')`);

    return result;
  }
}
