import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateBussinessUsecase } from '../application/create-bussiness.usecase';
import { FindBussinessByIdUseCase } from '../application/find-bussiness-by-id.usecase';
import { UpdateBussinessUseCase } from '../application/update-bussiness.usecase';
import { DeleteBussinessUseCase } from '../application/delete-bussiness.usecase';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';
// import { ToggleActivateBussinessUseCase } from '../application/toggle-activate-bussiness-usecase';

@Controller('bussiness')
export class BussinessController {
  constructor(
    private readonly createBussinessUseCase: CreateBussinessUsecase,
    private readonly findBussinessByIdUseCase: FindBussinessByIdUseCase,
    private readonly updateBussinessUseCase: UpdateBussinessUseCase,
    private readonly deleteBussinessUseCase: DeleteBussinessUseCase,
    // private readonly toggleActivateBussinessUseCase: ToggleActivateBussinessUseCase,
  ) {}

  @Post('create')
  async createBussiness(@Body() dto: CreateBussinessDto) {
    return await this.createBussinessUseCase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findBussinessByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBussinessDto>,
  ) {
    return await this.updateBussinessUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteBussinessUseCase.execute(id);
  }

  // @Patch(':id/toggle-activate')
  // async activate(@Param('id') id: string) {
  //   return await this.toggleActivateBussinessUseCase.execute(id);
  // }
}
