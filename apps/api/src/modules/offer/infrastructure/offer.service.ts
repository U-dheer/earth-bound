import { Injectable } from '@nestjs/common';
import { OfferRepository } from './offer.repository';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Injectable()
export class OfferService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createOffer(offerData: CreateOfferDto) {
    return this.offerRepository.createOffer(offerData);
  }
}
