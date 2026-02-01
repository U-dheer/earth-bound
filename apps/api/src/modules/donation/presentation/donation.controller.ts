import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateDonationUsecase } from '../application/createDonationUsecase';
import { FindDonationByIdUseCase } from '../application/find-donation-by-id.usecase';
import { FindAllDonationsUseCase } from '../application/find-all-donations.usecase';
import { UpdateDonationUseCase } from '../application/update-donation.usecase';
import { DeleteDonationUseCase } from '../application/delete-donation.usecase';
import { CreateDonationDto } from '../dto/createDonation.dto';

@Controller('donation')
export class DonationController {
  constructor(
    private readonly createDonationUsecase: CreateDonationUsecase,
    private readonly findDonationByIdUseCase: FindDonationByIdUseCase,
    private readonly findAllDonationsUseCase: FindAllDonationsUseCase,
    private readonly updateDonationUseCase: UpdateDonationUseCase,
    private readonly deleteDonationUseCase: DeleteDonationUseCase,
  ) {}

  @Post('create/:id')
  async createDonation(
    @Body() dto: CreateDonationDto,
    @Param('id') id: string,
  ) {
    return await this.createDonationUsecase.execute(dto, id);
  }

  @Get()
  async findAll() {
    return await this.findAllDonationsUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findDonationByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDonationDto>,
  ) {
    return await this.updateDonationUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteDonationUseCase.execute(id);
  }
}
