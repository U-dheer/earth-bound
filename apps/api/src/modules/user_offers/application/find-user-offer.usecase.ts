import { BadRequestException, Injectable } from '@nestjs/common';
import { UserOfferService } from '../infrastructure/user_offer.service';

@Injectable()
export class FindUserOfferUseCase {
  constructor(private readonly userOfferService: UserOfferService) {}

  async execute(userId: string, offerId: string) {
    try {
      const userOffer = await this.userOfferService.findUserOffer(
        userId,
        offerId,
      );
      return userOffer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to find user offer',
      );
    }
  }
}
