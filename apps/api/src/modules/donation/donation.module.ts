import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { DonationController } from './presentation/donation.controller';
import { DonationRepository } from './infrastructure/donation.repository';
import { DonationService } from './infrastructure/donation.service';
import { CreateDonationUsecase } from './application/createDonationUsecase';
import { FindDonationByIdUseCase } from './application/find-donation-by-id.usecase';
import { FindAllDonationsUseCase } from './application/find-all-donations.usecase';
import { UpdateDonationUseCase } from './application/update-donation.usecase';
import { DeleteDonationUseCase } from './application/delete-donation.usecase';
import { GetTotalDonationByCsrUseCase } from './application/get-total-donation-by-csr.usecase';
import { GetAllCsrDonationTotalsUseCase } from './application/get-all-csr-donation-totals.usecase';
import { GetUserDonationHistoryUseCase } from './application/get-user-donation-history.usecase';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [DonationController],
  providers: [
    DonationRepository,
    DonationService,
    CreateDonationUsecase,
    FindDonationByIdUseCase,
    FindAllDonationsUseCase,
    UpdateDonationUseCase,
    DeleteDonationUseCase,
    GetTotalDonationByCsrUseCase,
    GetAllCsrDonationTotalsUseCase,
    GetUserDonationHistoryUseCase,
  ],
  exports: [DonationService, DonationRepository],
})
export class DonationModule {}
