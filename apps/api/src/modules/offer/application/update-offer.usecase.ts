import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Injectable()
export class UpdateOfferUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute(id: string, data: Partial<CreateOfferDto>) {
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
