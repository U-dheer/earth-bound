import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { CreateOrganizerDto } from '../dto/createOrganizer.dto';
import { organizers } from './schema/organizer.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class OrganizerRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createOrganizer(data: CreateOrganizerDto) {
    const [result] = await this.db.insert(organizers).values(data).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(organizers)
      .where(eq(organizers.id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateOrganizerDto>) {
    const [result] = await this.db
      .update(organizers)
      .set(data)
      .where(eq(organizers.id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(organizers)
      .where(eq(organizers.id, id))
      .returning();

    return result;
  }
}
