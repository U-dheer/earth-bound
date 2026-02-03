import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';

@Injectable()
export class GetAllCsrDonationTotalsUseCase {
  constructor(private readonly donationService: DonationService) {}

  async execute() {
    try {
      const results =
        await this.donationService.getAllCsrProjectsWithDonationTotals();
      return results;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to get donation totals for all CSR projects',
      );
    }
  }
}
