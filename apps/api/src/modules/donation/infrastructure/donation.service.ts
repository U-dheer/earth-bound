import { Injectable } from '@nestjs/common';
import { DonationRepository } from './donation.repository';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Injectable()
export class DonationService {
  constructor(private readonly donationRepository: DonationRepository) {}

  async createDonation(donationData: CreateDonationDto) {
    return this.donationRepository.create(donationData);
  }
}
