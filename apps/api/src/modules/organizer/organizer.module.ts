import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/shared/database/drizzle.module';
import { OrganizerController } from './presentation/organizer.controller';
import { OrganizerRepository } from './infrastructure/organizer.repository';
import { OrganizerService } from './infrastructure/organizer.service';
import { CreateOrganizerUseCase } from './application/create-organizer.usecase';
import { FindOrganizerByIdUseCase } from './application/find-organizer-by-id.usecase';
import { UpdateOrganizerUseCase } from './application/update-organizer.usecase';
import { DeleteOrganizerUseCase } from './application/delete-organizer.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizerController],
  providers: [
    OrganizerRepository,
    OrganizerService,
    CreateOrganizerUseCase,
    FindOrganizerByIdUseCase,
    UpdateOrganizerUseCase,
    DeleteOrganizerUseCase,
  ],
  exports: [OrganizerService, OrganizerRepository],
})
export class OrganizerModule {}
