import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { AdminController } from './presentation/admin.controller';
import { AdminRepository } from './infrastructure/admin.repository';
import { AdminService } from './infrastructure/admin.service';
import { CreateAdminUseCase } from './application/create-admin.usecase';
import { FindAdminByIdUseCase } from './application/find-admin-by-id.usecase';
import { UpdateAdminUseCase } from './application/update-admin.usecase';
import { DeleteAdminUseCase } from './application/delete-admin.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    AdminRepository,
    AdminService,
    CreateAdminUseCase,
    FindAdminByIdUseCase,
    UpdateAdminUseCase,
    DeleteAdminUseCase,
  ],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
