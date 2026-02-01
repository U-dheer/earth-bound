import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';

@Injectable()
export class GetAllOffersUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute() {
    try {
      const offers = await this.offerService.getAllOffers();
      return offers;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch all offers',
      );
    }
  }
}
