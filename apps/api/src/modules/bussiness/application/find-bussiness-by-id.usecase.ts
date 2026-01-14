import { BadRequestException, Injectable } from '@nestjs/common';
import { BussinessService } from '../infrastructure/bussiness.service';

@Injectable()
export class FindBussinessByIdUseCase {
  constructor(private readonly bussinessService: BussinessService) {}

  async execute(id: string) {
    try {
      const bussiness = await this.bussinessService.findById(id);
      return bussiness;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to find bussiness',
      );
    }
  }
}
