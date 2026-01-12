import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/crate-admin.dto';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async createAdmin(adminDto: CreateAdminDto) {
    return this.adminRepository.create(adminDto);
  }
}
