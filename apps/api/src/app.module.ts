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
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}
