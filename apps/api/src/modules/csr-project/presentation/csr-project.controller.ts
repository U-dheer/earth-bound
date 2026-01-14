import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateCsrProjectUsecase } from '../application/create-project.usecase';
import { FindCsrProjectByIdUseCase } from '../application/find-csr-project-by-id.usecase';
import { UpdateCsrProjectUseCase } from '../application/update-csr-project.usecase';
import { DeleteCsrProjectUseCase } from '../application/delete-csr-project.usecase';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Controller('csr-project')
export class CsrProjectController {
  constructor(
    private readonly createCsrProjectUsecase: CreateCsrProjectUsecase,
    private readonly findCsrProjectByIdUseCase: FindCsrProjectByIdUseCase,
    private readonly updateCsrProjectUseCase: UpdateCsrProjectUseCase,
    private readonly deleteCsrProjectUseCase: DeleteCsrProjectUseCase,
  ) {}

  @Post('create')
  async createCsrProject(@Body() dto: CreateCsrDto) {
    return await this.createCsrProjectUsecase.execute(dto);
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
}
