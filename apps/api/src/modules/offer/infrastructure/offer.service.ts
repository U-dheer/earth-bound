import { Injectable } from '@nestjs/common';
import { OfferRepository } from './offer.repository';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Injectable()
export class OfferService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createOffer(offerData: CreateOfferDto) {
    return this.offerRepository.createOffer(offerData);
  }

  async findById(id: string) {
    return this.offerRepository.findById(id);
  }

  async update(id: string, data: Partial<CreateOfferDto>) {
    return this.offerRepository.update(id, data);
  }

  async delete(id: string) {
    return this.offerRepository.delete(id);
  }

  async getAvailableOffers(userId: string) {
    return this.offerRepository.getAvailableOffers(userId);
  }
}
