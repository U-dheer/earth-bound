import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './shared/config';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { BussinessModule } from './modules/bussiness/bussiness.module';
import { OrganizerModule } from './modules/organizer/organizer.module';
import { AdminModule } from './modules/admin/admin.module';
import { CsrProjectModule } from './modules/csr-project/csr-project.module';
import { OfferModule } from './modules/offer/offer.module';
import { DonationModule } from './modules/donation/donation.module';
import { UserOfferModule } from './modules/user_offers/user_offer.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UserModule,
    BussinessModule,
    OrganizerModule,
    AdminModule,
    CsrProjectModule,
    OfferModule,
    DonationModule,
    UserOfferModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}
