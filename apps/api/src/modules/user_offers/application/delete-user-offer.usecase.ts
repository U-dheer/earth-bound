import { BadRequestException, Injectable } from '@nestjs/common';
import { UserOfferService } from '../infrastructure/user_offer.service';

@Injectable()
export class DeleteUserOfferUseCase {
  constructor(private readonly userOfferService: UserOfferService) {}

  async execute(userId: string, offerId: string) {
    try {
      const result = await this.userOfferService.deleteUserOffer(
        userId,
        offerId,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete user offer',
      );
    }
  }
}
