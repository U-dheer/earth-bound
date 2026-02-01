import { BadRequestException, Injectable } from '@nestjs/common';
import { OfferService } from '../infrastructure/offer.service';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Injectable()
export class CreateOffersUseCase {
  constructor(private readonly offerService: OfferService) {}

  async execute(data: CreateOfferDto, userId: any) {
    try {
      const offer = await this.offerService.createOffer(data, userId);
      return offer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create offer',
      );
    }
  }
}
