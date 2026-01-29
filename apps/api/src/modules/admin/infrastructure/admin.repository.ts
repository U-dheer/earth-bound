import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { admins } from './schema/admin.schema';
import { CreateAdminDto } from '../dto/crate-admin.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateAdminDto) {
    const [result] = await this.db.insert(admins).values(data).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateAdminDto>) {
    const [result] = await this.db
      .update(admins)
      .set(data)
      .where(eq(admins.id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(admins)
      .where(eq(admins.id, id))
      .returning();

    return result;
  }
}
