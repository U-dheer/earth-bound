import { BadRequestException, Injectable } from '@nestjs/common';
import { BussinessService } from '../infrastructure/bussiness.service';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Injectable()
export class CreateBussinessUsecase {
  constructor(private readonly bussinessSerivece: BussinessService) {}

  async execute(data: CreateBussinessDto) {
    try {
      const bussiness = await this.bussinessSerivece.createBussiness(data);
      return bussiness;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create bussiness',
      );
    }
  }
}
