import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { DonationController } from './presentation/donation.controller';
import { DonationRepository } from './infrastructure/donation.repository';
import { DonationService } from './infrastructure/donation.service';
import { CreateDonationUsecase } from './application/createDonationUsecase';

@Module({
  imports: [DatabaseModule],
  controllers: [DonationController],
  providers: [DonationRepository, DonationService, CreateDonationUsecase],
  exports: [DonationService, DonationRepository],
})
export class DonationModule {}
