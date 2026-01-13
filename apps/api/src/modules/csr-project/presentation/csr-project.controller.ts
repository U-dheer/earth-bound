import { Body, Controller, Post } from '@nestjs/common';
import { CreateCsrProjectUsecase } from '../application/create-project.usecase';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Controller('csr-project')
export class CsrProjectController {
  constructor(
    private readonly createCsrProjectUsecase: CreateCsrProjectUsecase,
  ) {}

  @Post('create')
  async createCsrProject(@Body() dto: CreateCsrDto) {
    return await this.createCsrProjectUsecase.execute(dto);
  }
}
