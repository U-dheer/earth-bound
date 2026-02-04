import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseFloatPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateOffersUseCase } from '../application/create-offer.usecase';
import { FindOfferByIdUseCase } from '../application/find-offer-by-id.usecase';
import { UpdateOfferUseCase } from '../application/update-offer.usecase';
import { DeleteOfferUseCase } from '../application/delete-offer.usecase';
import { GetAvailableOffersUseCase } from '../application/get-available-offers.usecase';
import { GetAllOffersUseCase } from '../application/get-all-offers.usecase';
import { GetMyOffersUseCase } from '../application/get-my-offers.usecase';
import { CreateOfferDto } from '../dto/createoffer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('offers')
export class OfferController {
  constructor(
    private readonly createOfferUsecase: CreateOffersUseCase,
    private readonly findOfferByIdUseCase: FindOfferByIdUseCase,
    private readonly updateOfferUseCase: UpdateOfferUseCase,
    private readonly deleteOfferUseCase: DeleteOfferUseCase,
    private readonly getAvailableOffersUseCase: GetAvailableOffersUseCase,
    private readonly getAllOffersUseCase: GetAllOffersUseCase,
    private readonly getMyOffersUseCase: GetMyOffersUseCase,
  ) {}

  // Public endpoint - no auth required
  @Get('all')
  async getAllOffers() {
    return await this.getAllOffersUseCase.execute();
  }

  @Get('my-offers')
  @UseGuards(AuthGuard)
  async getMyOffers(@CurrentUser('userId') userId: string) {
    return await this.getMyOffersUseCase.execute(userId);
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async createOffer(
    @Body() dto: CreateOfferDto,
    @CurrentUser('userId') userId: any,
  ) {
    return await this.createOfferUsecase.execute(dto, userId);
  }

  @Get('available')
  @UseGuards(AuthGuard)
  async getAvailableOffers(@CurrentUser('userId') userId: any) {
    return await this.getAvailableOffersUseCase.execute(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findOfferByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return await this.updateOfferUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteOfferUseCase.execute(id);
  }
}
