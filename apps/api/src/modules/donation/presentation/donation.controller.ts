import { Body, Controller, Post } from '@nestjs/common';
import { CreateDonationUsecase } from '../application/createDonationUsecase';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Controller('donation')
export class DonationController {
  constructor(private readonly createDonationUsecase: CreateDonationUsecase) {}

  @Post('create')
  async createDonation(@Body() dto: CreateDonationDto) {
    return await this.createDonationUsecase.execute(dto);
  }
}
