import { Body, Controller, Post } from '@nestjs/common';
import { CreateBussinessUsecase } from '../application/create-bussiness.usecase';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Controller('bussiness')
export class BussinessController {
  constructor(
    private readonly createBussinessUseCase: CreateBussinessUsecase,
  ) {}

  @Post('create')
  async createBussiness(@Body() dto: CreateBussinessDto) {
    return await this.createBussinessUseCase.execute(dto);
  }
}
