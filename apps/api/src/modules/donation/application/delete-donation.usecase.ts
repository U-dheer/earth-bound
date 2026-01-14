import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';

@Injectable()
export class DeleteDonationUseCase {
  constructor(private readonly donationService: DonationService) {}

  async execute(id: string) {
    try {
      const donation = await this.donationService.delete(id);
      return donation;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete donation',
      );
    }
  }
}
