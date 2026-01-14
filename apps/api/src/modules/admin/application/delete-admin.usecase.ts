import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminService } from '../infrastructure/admin.service';

@Injectable()
export class DeleteAdminUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(id: string) {
    try {
      const admin = await this.adminService.delete(id);
      return admin;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete admin user',
      );
    }
  }
}
