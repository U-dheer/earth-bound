import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateOffersUseCase } from '../application/create-offer.usecase';
import { FindOfferByIdUseCase } from '../application/find-offer-by-id.usecase';
import { UpdateOfferUseCase } from '../application/update-offer.usecase';
import { DeleteOfferUseCase } from '../application/delete-offer.usecase';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Controller('offers')
export class OfferController {
  constructor(
    private readonly createOfferUsecase: CreateOffersUseCase,
    private readonly findOfferByIdUseCase: FindOfferByIdUseCase,
    private readonly updateOfferUseCase: UpdateOfferUseCase,
    private readonly deleteOfferUseCase: DeleteOfferUseCase,
  ) {}

  @Post('create')
  async createOffer(@Body() dto: CreateOfferDto) {
    return await this.createOfferUsecase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findOfferByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateOfferDto>) {
    return await this.updateOfferUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteOfferUseCase.execute(id);
  }
}
