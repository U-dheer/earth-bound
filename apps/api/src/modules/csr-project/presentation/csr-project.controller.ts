import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateCsrProjectUsecase } from '../application/create-project.usecase';
import { FindCsrProjectByIdUseCase } from '../application/find-csr-project-by-id.usecase';
import { FindAllCsrProjectsUseCase } from '../application/find-all-csr-projects.usecase';
import { UpdateCsrProjectUseCase } from '../application/update-csr-project.usecase';
import { DeleteCsrProjectUseCase } from '../application/delete-csr-project.usecase';
import { ToggleCsrProjectStatusUseCase } from '../application/toggle-csr-project-status.usecase';
import { FindActivatedCsrProjectsUseCase } from '../application/find-activated-csr-projects.usecase';
import { FindDeactivatedCsrProjectsUseCase } from '../application/find-deactivated-csr-projects.usecase';
import { FindCsrProjectsByOrganizerUseCase } from '../application/find-csr-projects-by-organizer.usecase';
import { CreateCsrDto } from '../dto/create_csr-project.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthGuard } from '../../../shared/guards/auth.guard';

@Controller('csr-project')
@UseGuards(AuthGuard)
export class CsrProjectController {
  constructor(
    private readonly createCsrProjectUsecase: CreateCsrProjectUsecase,
    private readonly findCsrProjectByIdUseCase: FindCsrProjectByIdUseCase,
    private readonly findAllCsrProjectsUseCase: FindAllCsrProjectsUseCase,
    private readonly updateCsrProjectUseCase: UpdateCsrProjectUseCase,
    private readonly deleteCsrProjectUseCase: DeleteCsrProjectUseCase,
    private readonly toggleCsrProjectStatusUseCase: ToggleCsrProjectStatusUseCase,
    private readonly findActivatedCsrProjectsUseCase: FindActivatedCsrProjectsUseCase,
    private readonly findDeactivatedCsrProjectsUseCase: FindDeactivatedCsrProjectsUseCase,
    private readonly findCsrProjectsByOrganizerUseCase: FindCsrProjectsByOrganizerUseCase,
  ) {}

  @Post('create')
  async createCsrProject(
    @Body() dto: CreateCsrDto,
    @CurrentUser('userId') organizerId: any,
  ) {
    console.log('Organizer ID:', organizerId);
    return await this.createCsrProjectUsecase.execute(dto, organizerId);
  }

  @Get()
  async findAll() {
    return await this.findAllCsrProjectsUseCase.execute();
  }

  @Get('status/activated')
  async findActivated() {
    return await this.findActivatedCsrProjectsUseCase.execute();
  }

  @Get('status/deactivated')
  async findDeactivated() {
    return await this.findDeactivatedCsrProjectsUseCase.execute();
  }

  @Get('my-projects')
  async findMyProjects(@CurrentUser('userId') organizerId: string) {
    return await this.findCsrProjectsByOrganizerUseCase.execute(organizerId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findCsrProjectByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCsrDto>) {
    return await this.updateCsrProjectUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteCsrProjectUseCase.execute(id);
  }

  @Patch('toggle-status/:id')
  async toggleStatus(@Param('id') id: string) {
    return await this.toggleCsrProjectStatusUseCase.execute(id);
  }
}
