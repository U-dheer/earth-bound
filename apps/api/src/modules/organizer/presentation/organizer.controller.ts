import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrganizerDto } from '../dto/createOrganizer.dto';
import { CreateOrganizerUseCase } from '../application/create-organizer.usecase';

@Controller('organizer')
export class OrganizerController {
  constructor(
    private readonly createOrganizerUsecase: CreateOrganizerUseCase,
  ) {}

  @Post('create')
  async createOrganizer(@Body() dto: CreateOrganizerDto) {
    return await this.createOrganizerUsecase.execute(dto);
  }
}
