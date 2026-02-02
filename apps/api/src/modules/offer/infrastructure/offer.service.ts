import { Injectable } from '@nestjs/common';
import { OfferRepository } from './offer.repository';
import { CreateOfferDto } from '../dto/createoffer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';

@Injectable()
export class OfferService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createOffer(offerData: CreateOfferDto, userId: any) {
    return this.offerRepository.createOffer(offerData, userId);
  }

  async findById(id: string) {
    return this.offerRepository.findById(id);
  }

  async update(id: string, data: UpdateOfferDto) {
    return this.offerRepository.update(id, data);
  }

  async delete(id: string) {
    return this.offerRepository.delete(id);
  }

  async getAvailableOffers(userId: any) {
    return this.offerRepository.getAvailableOffers(userId);
  }

  async getAllOffers() {
    return this.offerRepository.getAllOffers();
  }
}
