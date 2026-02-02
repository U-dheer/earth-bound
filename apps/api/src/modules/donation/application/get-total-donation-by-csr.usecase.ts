import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';

@Injectable()
export class GetTotalDonationByCsrUseCase {
  constructor(private readonly donationService: DonationService) {}

  async execute(csrId: string) {
    try {
      const total = await this.donationService.getTotalDonationByCsrId(csrId);
      return { csrId, totalAmount: total };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to get total donations for CSR project',
      );
    }
  }
}
