import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './shared/config';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { BussinessModule } from './modules/bussiness/bussiness.module';
import { OrganizerModule } from './modules/organizer/organizer.module';
import { AdminModule } from './modules/admin/admin.module';
import { CsrProjectModule } from './modules/csr-project/csr-project.module';
import { OfferModule } from './modules/offer/offer.module';
import { DonationModule } from './modules/donation/donation.module';
import { UserOfferModule } from './modules/user_offers/user_offer.module';
import { StripeModule } from './modules/stripe/stripe.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      global: true,
    }),
    UserModule,
    BussinessModule,
    OrganizerModule,
    AdminModule,
    CsrProjectModule,
    OfferModule,
    DonationModule,
    StripeModule,
    UserOfferModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}
