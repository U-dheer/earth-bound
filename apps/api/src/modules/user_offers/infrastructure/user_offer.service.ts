import { Injectable } from '@nestjs/common';
import { UserOfferRepository } from './user_offer.repository';
import { CreateUserOfferDto } from '../dto/create-user-offer.dto';

@Injectable()
export class UserOfferService {
  constructor(private readonly userOfferRepository: UserOfferRepository) {}

  async createUserOffer(data: CreateUserOfferDto) {
    return this.userOfferRepository.create(data);
  }

  async findUserOffer(userId: string, offerId: string) {
    return this.userOfferRepository.findOne(userId, offerId);
  }

  async deleteUserOffer(userId: string, offerId: string) {
    return this.userOfferRepository.delete(userId, offerId);
  }

  async redeemOffer(userId: string, offerId: string) {
    return this.userOfferRepository.redemmedOffer({
      userId,
      offerId,
    });
  }
}
