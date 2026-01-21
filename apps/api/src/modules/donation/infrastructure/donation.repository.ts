import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { CreateDonationDto } from '../dto/createDonation.dto';
import { donations } from './schema/donation.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DonationRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateDonationDto, id: string) {
    try {
      const [result] = await this.db
        .insert(donations)
        .values({
          amount: data.amount,
          csrId: data.csrId ?? id,
          userId: data.userId,
        })
        .returning()
        .execute();
      return result;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(donations)
      .where(eq(donations.donation_id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateDonationDto>) {
    const [result] = await this.db
      .update(donations)
      .set(data)
      .where(eq(donations.donation_id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(donations)
      .where(eq(donations.donation_id, id))
      .returning();

    return result;
  }
}
