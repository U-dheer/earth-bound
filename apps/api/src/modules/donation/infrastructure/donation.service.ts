import { Injectable } from '@nestjs/common';
import { DonationRepository } from './donation.repository';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Injectable()
export class DonationService {
  constructor(private readonly donationRepository: DonationRepository) {}

  async createDonation(donationData: CreateDonationDto) {
    return this.donationRepository.create(donationData);
  }

  async findById(id: string) {
    return this.donationRepository.findById(id);
  }

  async update(id: string, data: Partial<CreateDonationDto>) {
    return this.donationRepository.update(id, data);
  }

  async delete(id: string) {
    return this.donationRepository.delete(id);
  }
}
