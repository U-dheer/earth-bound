import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { AdminController } from './presentation/admin.controller';
import { AdminRepository } from './infrastructure/admin.repository';
import { AdminService } from './infrastructure/admin.service';
import { DashboardRepository } from './infrastructure/dashboard.repository';
import { CreateAdminUseCase } from './application/create-admin.usecase';
import { FindAdminByIdUseCase } from './application/find-admin-by-id.usecase';
import { UpdateAdminUseCase } from './application/update-admin.usecase';
import { DeleteAdminUseCase } from './application/delete-admin.usecase';
import { ToggleCsrActiveUseCase } from './application/toggle-csr-active.usecase';
import { GetEarningsChartUseCase } from './application/get-earnings-chart.usecase';
import { CsrProjectModule } from '../csr-project/csr-project.module';

@Module({
  imports: [DatabaseModule, CsrProjectModule],
  controllers: [AdminController],
  providers: [
    AdminRepository,
    AdminService,
    DashboardRepository,
    CreateAdminUseCase,
    FindAdminByIdUseCase,
    UpdateAdminUseCase,
    DeleteAdminUseCase,
    ToggleCsrActiveUseCase,
    GetEarningsChartUseCase,
  ],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
