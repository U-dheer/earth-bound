import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminService } from '../infrastructure/admin.service';
import { CreateAdminDto } from '../dto/crate-admin.dto';

@Injectable()
export class UpdateAdminUseCase {
  constructor(private readonly adminService: AdminService) {}

  async execute(id: string, data: Partial<CreateAdminDto>) {
    try {
      const admin = await this.adminService.update(id, data);
      return admin;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update admin user',
      );
    }
  }
}
