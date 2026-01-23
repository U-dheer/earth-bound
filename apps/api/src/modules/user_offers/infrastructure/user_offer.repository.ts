import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { and, eq } from 'drizzle-orm';
import { CreateUserOfferDto } from '../dto/create-user-offer.dto';
import { UserOffers } from './schema/user_offer.schema';
import { OfferService } from 'src/modules/offer/infrastructure/offer.service';
import { generateRedeemPoints } from 'src/utils/redeem_points_generater';
import { UserService } from 'src/modules/user/infrastructure/user.service';
import { RedeemDataDto } from '../dto/redeemData.dto';

@Injectable()
export class UserOfferRepository {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient,
    private readonly offerService: OfferService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateUserOfferDto) {
    const [result] = await this.db.insert(UserOffers).values(data).returning();
    return result;
  }

  async findOne(userId: string, offerId: string) {
    const [result] = await this.db
      .select()
      .from(UserOffers)
      .where(
        and(eq(UserOffers.userId, userId), eq(UserOffers.offerId, offerId)),
      )
      .limit(1)
      .execute();
    return result;
  }

  async delete(userId: string, offerId: string) {
    const [result] = await this.db
      .delete(UserOffers)
      .where(
        and(eq(UserOffers.userId, userId), eq(UserOffers.offerId, offerId)),
      )
      .returning();
    return result;
  }

  async redemmedOffer(redeemedData: RedeemDataDto) {
    await this.db.insert(UserOffers).values(redeemedData).returning();
  }
}
