import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdminDto } from '../dto/crate-admin.dto';
import { CreateAdminUseCase } from '../application/create-admin.usecase';

@Controller('admin')
export class AdminController {
  constructor(private readonly createAdminUsecase: CreateAdminUseCase) {}

  @Post('create')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return await this.createAdminUsecase.execute(dto);
  }
}
