import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { BussinessController } from './presentation/bussiness.controller';
import { BussinessRepository } from './infrastructure/bussiness.repository';
import { BussinessService } from './infrastructure/bussiness.service';
import { CreateBussinessUsecase } from './application/create-bussiness.usecase';
import { FindBussinessByIdUseCase } from './application/find-bussiness-by-id.usecase';
import { UpdateBussinessUseCase } from './application/update-bussiness.usecase';
import { DeleteBussinessUseCase } from './application/delete-bussiness.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [BussinessController],
  providers: [
    BussinessRepository,
    BussinessService,
    CreateBussinessUsecase,
    FindBussinessByIdUseCase,
    UpdateBussinessUseCase,
    DeleteBussinessUseCase,
  ],
  exports: [BussinessService, BussinessRepository],
})
export class BussinessModule {}
