import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateOrganizerDto } from '../dto/createOrganizer.dto';
import { CreateOrganizerUseCase } from '../application/create-organizer.usecase';
import { FindOrganizerByIdUseCase } from '../application/find-organizer-by-id.usecase';
import { UpdateOrganizerUseCase } from '../application/update-organizer.usecase';
import { DeleteOrganizerUseCase } from '../application/delete-organizer.usecase';

@Controller('organizer')
export class OrganizerController {
  constructor(
    private readonly createOrganizerUsecase: CreateOrganizerUseCase,
    private readonly findOrganizerByIdUseCase: FindOrganizerByIdUseCase,
    private readonly updateOrganizerUseCase: UpdateOrganizerUseCase,
    private readonly deleteOrganizerUseCase: DeleteOrganizerUseCase,
  ) {}

  @Post('create')
  async createOrganizer(@Body() dto: CreateOrganizerDto) {
    return await this.createOrganizerUsecase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findOrganizerByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrganizerDto>,
  ) {
    return await this.updateOrganizerUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteOrganizerUseCase.execute(id);
  }
}
