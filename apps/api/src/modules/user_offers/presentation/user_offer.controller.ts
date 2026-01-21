import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserOfferUseCase } from '../application/create-user-offer.usecase';
import { FindUserOfferUseCase } from '../application/find-user-offer.usecase';
import { DeleteUserOfferUseCase } from '../application/delete-user-offer.usecase';
import { CreateUserOfferDto } from '../dto/create-user-offer.dto';
import { RedeemOfferUseCase } from '../application/redeem_offer.usecase';

@Controller('user-offers')
export class UserOfferController {
  constructor(
    private readonly createUserOfferUseCase: CreateUserOfferUseCase,
    private readonly findUserOfferUseCase: FindUserOfferUseCase,
    private readonly deleteUserOfferUseCase: DeleteUserOfferUseCase,
    private readonly redeemOfferUseCase: RedeemOfferUseCase,
  ) {}

  @Post('create')
  async create(@Body() dto: CreateUserOfferDto) {
    return await this.createUserOfferUseCase.execute(dto);
  }

  @Get(':userId/:offerId')
  async find(
    @Param('userId') userId: string,
    @Param('offerId') offerId: string,
  ) {
    return await this.findUserOfferUseCase.execute(userId, offerId);
  }

  @Delete(':userId/:offerId')
  async delete(
    @Param('userId') userId: string,
    @Param('offerId') offerId: string,
  ) {
    return await this.deleteUserOfferUseCase.execute(userId, offerId);
  }

  @Post('redeem/:userId')
  async redeem(
    @Param('userId') userId: string,
    @Body('totalBill') totalBill: number,
    @Body('offerCode') offerCode: string,
  ) {
    return await this.redeemOfferUseCase.execute(userId, totalBill, offerCode);
  }
}
