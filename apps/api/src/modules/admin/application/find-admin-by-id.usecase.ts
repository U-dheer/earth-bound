import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminService } from '../infrastructure/admin.service';

@Injectable()
export class FindAdminByIdUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(id: string) {
    try {
      const admin = await this.adminService.findById(id);
      return admin;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to find admin user',
      );
    }
  }
}
