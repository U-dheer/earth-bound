import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { UserOfferController } from './presentation/user_offer.controller';
import { UserOfferRepository } from './infrastructure/user_offer.repository';
import { UserOfferService } from './infrastructure/user_offer.service';
import { CreateUserOfferUseCase } from './application/create-user-offer.usecase';
import { FindUserOfferUseCase } from './application/find-user-offer.usecase';
import { DeleteUserOfferUseCase } from './application/delete-user-offer.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [UserOfferController],
  providers: [
    UserOfferRepository,
    UserOfferService,
    CreateUserOfferUseCase,
    FindUserOfferUseCase,
    DeleteUserOfferUseCase,
  ],
  exports: [UserOfferService, UserOfferRepository],
})
export class UserOfferModule {}
