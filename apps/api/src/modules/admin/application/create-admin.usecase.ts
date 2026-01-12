import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminService } from '../infrastructure/admin.service';
import { CreateAdminDto } from '../dto/crate-admin.dto';

@Injectable()
export class CreateAdminUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(data: CreateAdminDto) {
    try {
      const admin = await this.adminService.createAdmin(data);
      return admin;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create admin user',
      );
    }
  }
}
