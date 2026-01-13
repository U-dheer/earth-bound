import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { offers } from './schema/offer.schema';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Injectable()
export class OfferRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createOffer(data: CreateOfferDto) {
    const [result] = await this.db.insert(offers).values(data).returning();
    return result;
  }
}
