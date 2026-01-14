import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';

@Injectable()
export class FindOfferByIdUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute(id: string) {
    try {
      const offer = await this.offerService.findById(id);
      return offer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to find offer',
      );
    }
  }
}
