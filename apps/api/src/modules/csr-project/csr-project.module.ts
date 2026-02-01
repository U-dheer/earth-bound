import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { CsrProjectController } from './presentation/csr-project.controller';
import { CsrProjectRepository } from './infrastructure/csr-project.repository';
import { CsrProjectService } from './infrastructure/csr-project.service';
import { CreateCsrProjectUsecase } from './application/create-project.usecase';
import { FindCsrProjectByIdUseCase } from './application/find-csr-project-by-id.usecase';
import { FindAllCsrProjectsUseCase } from './application/find-all-csr-projects.usecase';
import { UpdateCsrProjectUseCase } from './application/update-csr-project.usecase';
import { DeleteCsrProjectUseCase } from './application/delete-csr-project.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [CsrProjectController],
  providers: [
    CsrProjectRepository,
    CsrProjectService,
    CreateCsrProjectUsecase,
    FindCsrProjectByIdUseCase,
    FindAllCsrProjectsUseCase,
    UpdateCsrProjectUseCase,
    DeleteCsrProjectUseCase,
  ],
  exports: [CsrProjectRepository, CsrProjectService],
})
export class CsrProjectModule {}
