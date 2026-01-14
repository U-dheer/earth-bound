import { BadRequestException, Injectable } from '@nestjs/common';
import { BussinessService } from '../infrastructure/bussiness.service';

@Injectable()
export class DeleteBussinessUseCase {
  constructor(private readonly bussinessService: BussinessService) {}

  async execute(id: string) {
    try {
      const bussiness = await this.bussinessService.delete(id);
      return bussiness;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete bussiness',
      );
    }
  }
}
