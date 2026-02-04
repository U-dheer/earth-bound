import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';

@Injectable()
export class GetMyOffersUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute(userId: string) {
    try {
      const offers = await this.offerService.getOffersByCreator(userId);
      return offers;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch your offers',
      );
    }
  }
}
