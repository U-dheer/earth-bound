import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { offers } from './schema/offer.schema';
import { CreateOfferDto } from '../dto/createoffer.dto';
import { eq, lte } from 'drizzle-orm';
import { UserService } from 'src/modules/user/infrastructure/user.service';

@Injectable()
export class OfferRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient,
    private readonly userService: UserService,
  ) {}

  async createOffer(data: CreateOfferDto, userId: any) {
    try {
      const [result] = await this.db
        .insert(offers)
        .values({ ...data, bussinessId: userId })
        .returning();
      return result;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
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

  async getAvailableOffers(userId: any) {
    console.log('userId', userId);
    const userData = await this.userService.findUserById(userId);
    if (!userData) {
      throw new Error('User not found');
    }
    const [avilableOffers] = await this.db
      .select()
      .from(offers)
      .where(lte(offers.redeemamountForGetTheOffer, userData.redeemPoints))
      .execute();
    return [avilableOffers];
  }
}
