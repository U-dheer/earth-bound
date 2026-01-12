import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { BussinessController } from './presentation/bussiness.controller';
import { BussinessRepository } from './infrastructure/bussiness.repository';
import { BussinessService } from './infrastructure/bussiness.service';
import { CreateBussinessUsecase } from './application/create-bussiness.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [BussinessController],
  providers: [BussinessRepository, BussinessService, CreateBussinessUsecase],
  exports: [BussinessService, BussinessRepository],
})
export class BussinessModule {}
