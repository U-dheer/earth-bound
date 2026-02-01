import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateAdminDto } from '../dto/crate-admin.dto';
import { CreateAdminUseCase } from '../application/create-admin.usecase';
import { FindAdminByIdUseCase } from '../application/find-admin-by-id.usecase';
import { UpdateAdminUseCase } from '../application/update-admin.usecase';
import { DeleteAdminUseCase } from '../application/delete-admin.usecase';
import { ToggleCsrActiveUseCase } from '../application/toggle-csr-active.usecase';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly createAdminUsecase: CreateAdminUseCase,
    private readonly findAdminByIdUseCase: FindAdminByIdUseCase,
    private readonly updateAdminUseCase: UpdateAdminUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
    private readonly toggleCsrActiveUseCase: ToggleCsrActiveUseCase,
  ) {}

  @Post('create')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return await this.createAdminUsecase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findAdminByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateAdminDto>) {
    return await this.updateAdminUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteAdminUseCase.execute(id);
  }

  @Patch('toggle-active/:id')
  async toggleCsrActive(@Param('id') id: string) {
    return await this.toggleCsrActiveUseCase.execute(id);
  }
}
