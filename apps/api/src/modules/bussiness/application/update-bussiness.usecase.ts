import { BadRequestException, Injectable } from '@nestjs/common';
import { BussinessService } from '../infrastructure/bussiness.service';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Injectable()
export class UpdateBussinessUseCase {
  constructor(private readonly bussinessService: BussinessService) {}

  async execute(id: string, data: Partial<CreateBussinessDto>) {
    try {
      const bussiness = await this.bussinessService.update(id, data);
      return bussiness;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update bussiness',
      );
    }
  }
}
