import { BadRequestException, Injectable } from '@nestjs/common';
import { UserOfferService } from '../infrastructure/user_offer.service';
import { CreateUserOfferDto } from '../dto/create-user-offer.dto';

@Injectable()
export class CreateUserOfferUseCase {
  constructor(private readonly userOfferService: UserOfferService) {}

  async execute(data: CreateUserOfferDto) {
    try {
      const userOffer = await this.userOfferService.createUserOffer(data);
      return userOffer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create user offer',
      );
    }
  }
}
