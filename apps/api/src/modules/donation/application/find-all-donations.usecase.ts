import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationRepository } from '../infrastructure/donation.repository';

@Injectable()
export class FindAllDonationsUseCase {
  constructor(private readonly donationRepository: DonationRepository) {}

  async execute() {
    try {
      return await this.donationRepository.findAll();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to find donations',
      );
    }
  }
}
