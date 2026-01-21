import { Module } from '@nestjs/common';
import { StripeService } from './infrastructure/stripe.service';
import { StripeController } from './presentation/stripe.controller';
import { HandeledWebhookUsecase } from './application/handeled_webhook.usecase';
import { CreateDonationUsecase } from '../donation/application/createDonationUsecase';
import { DonationService } from '../donation/infrastructure/donation.service';
import { UserService } from '../user/infrastructure/user.service';
import { DonationRepository } from '../donation/infrastructure/donation.repository';
import { UserRepository } from '../user/infrastructure/user.repository';
import { DatabaseModule } from 'src/shared/database/drizzle.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    HandeledWebhookUsecase,
    CreateDonationUsecase,
    DonationService,
    UserService,
    DonationRepository,
    UserRepository,
  ],
  exports: [StripeService, HandeledWebhookUsecase],
})
export class StripeModule {}
