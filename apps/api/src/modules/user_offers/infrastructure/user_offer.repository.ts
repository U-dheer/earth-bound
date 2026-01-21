import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { and, eq } from 'drizzle-orm';
import { CreateUserOfferDto } from '../dto/create-user-offer.dto';
import { UserOffers } from './schema/user_offer.schema';
import { OfferService } from 'src/modules/offer/infrastructure/offer.service';
import { generateRedeemPoints } from 'src/utils/redeem_points_generater';
import { UserService } from 'src/modules/user/infrastructure/user.service';

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

  async redeemOffer(userId: string, totalBill: number, offerCode: string) {
    const availableOffers = await this.offerService.getAvailableOffers(userId);

    if (!availableOffers || availableOffers.length === 0) {
      throw new Error('No available offers to redeem.');
    }

    const validOffer = availableOffers.find(
      (offer) => offer.offerCode === offerCode,
    );
    if (!validOffer) {
      throw new Error('Invalid offer code.');
    }

    const discountAmount = (validOffer.discountPercentage / 100) * totalBill;
    const reduceebleRedeemPoints = await generateRedeemPoints(discountAmount);

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const updatedRedeemPoints = user.redeemPoints - reduceebleRedeemPoints;

    await this.userService.updateUser(userId, {
      redeemPoints: updatedRedeemPoints,
    });

    return {
      'offer redeemed': validOffer.offerCode,
      'discount amount': discountAmount,
      'redeem points used': reduceebleRedeemPoints,
      'remaining redeem points': updatedRedeemPoints,
    };
  }
}
