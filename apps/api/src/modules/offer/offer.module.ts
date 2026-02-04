import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { OfferController } from './presentation/offer.controller';
import { OfferService } from './infrastructure/offer.service';
import { OfferRepository } from './infrastructure/offer.repository';
import { CreateOffersUseCase } from './application/create-offer.usecase';
import { FindOfferByIdUseCase } from './application/find-offer-by-id.usecase';
import { UpdateOfferUseCase } from './application/update-offer.usecase';
import { DeleteOfferUseCase } from './application/delete-offer.usecase';
import { GetAvailableOffersUseCase } from './application/get-available-offers.usecase';
import { GetAllOffersUseCase } from './application/get-all-offers.usecase';
import { GetMyOffersUseCase } from './application/get-my-offers.usecase';
import { UserService } from '../user/infrastructure/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [OfferController],
  providers: [
    OfferService,
    OfferRepository,
    CreateOffersUseCase,
    FindOfferByIdUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAvailableOffersUseCase,
    GetAllOffersUseCase,
    GetMyOffersUseCase,
  ],
  exports: [OfferService, OfferRepository],
})
export class OfferModule {}
