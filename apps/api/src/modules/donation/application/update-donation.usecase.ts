import { BadRequestException, Injectable } from '@nestjs/common';
import { DonationService } from '../infrastructure/donation.service';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Injectable()
export class UpdateDonationUseCase {
  constructor(private readonly donationService: DonationService) {}

  async execute(id: string, data: Partial<CreateDonationDto>) {
    try {
      const donation = await this.donationService.update(id, data);
      return donation;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update donation',
      );
    }
  }
}
