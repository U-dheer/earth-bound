import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Injectable()
export class CreateDonationUsecase {
  constructor(private readonly donationService: DonationService) {}

  async execute(data: CreateDonationDto) {
    try {
      const donation = await this.donationService.createDonation(data);
      return donation;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create donation',
      );
    }
  }
}
