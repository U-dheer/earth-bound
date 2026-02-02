import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { csrEvents } from './schema/csr.event.schema';
import { CreateCsrDto } from '../dto/create_csr-project.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class CsrProjectRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateCsrDto, organizer_id: string) {
    const [result] = await this.db
      .insert(csrEvents)
      .values({ ...data, organizer_id: organizer_id })
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(csrEvents)
      .where(eq(csrEvents.id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateCsrDto>) {
    const [result] = await this.db
      .update(csrEvents)
      .set(data)
      .where(eq(csrEvents.id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(csrEvents)
      .where(eq(csrEvents.id, id))
      .returning();

    return result;
  }

  async findAll() {
    const results = await this.db.select().from(csrEvents).execute();
    return results;
  }

  async toggleStatus(id: string, isApproved: boolean) {
    const [result] = await this.db
      .update(csrEvents)
      .set({ isApproved })
      .where(eq(csrEvents.id, id))
      .returning();

    return result;
  }

  async findByActivationStatus(isApproved: boolean) {
    const results = await this.db
      .select()
      .from(csrEvents)
      .where(eq(csrEvents.isApproved, isApproved))
      .execute();
    return results;
  }
}
