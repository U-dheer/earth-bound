import { Injectable } from '@nestjs/common';
import { BussinessRepository } from './bussiness.repository';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Injectable()
export class BussinessService {
  constructor(private readonly bussinessRepository: BussinessRepository) {}

  async createBussiness(bussinessData: CreateBussinessDto) {
    return this.bussinessRepository.createBussiness(bussinessData);
  }

  async findById(id: string) {
    return this.bussinessRepository.findById(id);
  }

  async update(id: string, data: Partial<CreateBussinessDto>) {
    return this.bussinessRepository.update(id, data);
  }

  async delete(id: string) {
    return this.bussinessRepository.delete(id);
  }

  // async toggleActivate(id: string) {
  //   return this.bussinessRepository.toggleActivate(id);
  // }
}
