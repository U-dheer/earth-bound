import { BadRequestException, Injectable } from '@nestjs/common';
import { UserOfferService } from '../infrastructure/user_offer.service';

@Injectable()
export class RedeemOfferUseCase {
  constructor(private readonly userOfferService: UserOfferService) {}

  async execute(userId: string, totalBill: number, offerCode: string) {
    try {
      const result = await this.userOfferService.redeemOffer(
        userId,
        totalBill,
        offerCode,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to redeem offer',
      );
    }
  }
}
