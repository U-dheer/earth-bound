import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { offers } from './schema/offer.schema';
import { CreateOfferDto } from '../dto/createoffer.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class OfferRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createOffer(data: CreateOfferDto) {
    const [result] = await this.db.insert(offers).values(data).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(offers)
      .where(eq(offers.offer_id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateOfferDto>) {
    const [result] = await this.db
      .update(offers)
      .set(data)
      .where(eq(offers.offer_id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(offers)
      .where(eq(offers.offer_id, id))
      .returning();

    return result;
  }
}
