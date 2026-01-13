import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { CsrProjectController } from './presentation/csr-project.controller';
import { CsrProjectRepository } from './infrastructure/csr-project.repository';
import { CsrProjectService } from './infrastructure/csr-project.service';
import { CreateCsrProjectUsecase } from './application/create-project.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [CsrProjectController],
  providers: [CsrProjectRepository, CsrProjectService, CreateCsrProjectUsecase],
  exports: [CsrProjectRepository, CsrProjectService],
})
export class CsrProjectModule {}
