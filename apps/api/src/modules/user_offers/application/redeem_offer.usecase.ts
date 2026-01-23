import { BadRequestException, Injectable } from '@nestjs/common';
import { UserOfferService } from '../infrastructure/user_offer.service';
import { UserService } from 'src/modules/user/infrastructure/user.service';
import { OfferService } from 'src/modules/offer/infrastructure/offer.service';
import { generateRedeemPoints } from 'src/utils/redeem_points_generater';
import { UserOffers } from '../infrastructure/schema/user_offer.schema';
import { RedeemDataDto } from '../dto/redeemData.dto';

@Injectable()
export class RedeemOfferUseCase {
  constructor(
    private readonly userOfferService: UserOfferService,
    private readonly offerService: OfferService,
    private readonly userService: UserService,
  ) {}

  async execute(userId: string, totalBill: number, offerCode: string) {
    try {
      const availableOffers =
        await this.offerService.getAvailableOffers(userId);

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

      console.log('UserId : ', userId);
      console.log('OfferId : ', validOffer.offer_id);

      try {
        await this.userOfferService.redeemOffer(userId, validOffer.offer_id);
      } catch (error) {
        throw new Error('Failed to record redeemed offer.');
      }

      return {
        'offer redeemed': validOffer.offerCode,
        'discount amount': discountAmount,
        'redeem points used': reduceebleRedeemPoints,
        'remaining redeem points': updatedRedeemPoints,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to redeem offer',
      );
    }
  }
}
