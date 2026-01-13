import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { CreateDonationDto } from '../dto/createDonation.dto';
import { donations } from './schema/donation.schema';

@Injectable()
export class DonationRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateDonationDto) {
    const [result] = await this.db.insert(donations).values(data).returning();
    return result;
  }
}
