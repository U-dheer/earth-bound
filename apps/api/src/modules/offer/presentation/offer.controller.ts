import { Body, Controller, Post } from '@nestjs/common';
import { CreateOffersUseCase } from '../application/create-offer.usecase';
import { CreateOfferDto } from '../dto/createoffer.dto';

@Controller('offers')
export class OfferController {
  constructor(private readonly createOfferUsecase: CreateOffersUseCase) {}

  @Post('create')
  async createOffer(@Body() dto: CreateOfferDto) {
    return await this.createOfferUsecase.execute(dto);
  }
}
