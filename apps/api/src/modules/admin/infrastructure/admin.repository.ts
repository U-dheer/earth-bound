import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { admins } from './schema/admin.schema';
import { CreateAdminDto } from '../dto/crate-admin.dto';

@Injectable()
export class AdminRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateAdminDto) {
    const [result] = await this.db.insert(admins).values(data).returning();
    return result;
  }
}
