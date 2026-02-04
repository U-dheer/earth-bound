import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationRepository } from '../infrastructure/donation.repository';

@Injectable()
export class GetUserDonationHistoryUseCase {
  constructor(private readonly donationRepository: DonationRepository) {}

  async execute(userId: string) {
    try {
      return await this.donationRepository.findByUserId(userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to get donation history',
      );
    }
  }
}
