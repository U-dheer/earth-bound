import { Injectable } from '@nestjs/common';
import { BussinessRepository } from './bussiness.repository';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Injectable()
export class BussinessService {
  constructor(private readonly bussinessRepository: BussinessRepository) {}

  async createBussiness(bussinessData: CreateBussinessDto) {
    return this.bussinessRepository.createBussiness(bussinessData);
  }
}
