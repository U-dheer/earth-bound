import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';
import { UpdateOfferDto } from '../dto/update-offer.dto';

@Injectable()
export class UpdateOfferUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute(id: string, data: UpdateOfferDto) {
    try {
      const offer = await this.offerService.update(id, data);
      return offer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update offer',
      );
    }
  }
}
