import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { csrEvents } from './schema/csr.event.schema';
import { CreateCsrDto } from '../dto/create_csr-project.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class CsrProjectRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateCsrDto) {
    const [result] = await this.db.insert(csrEvents).values(data).returning();
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
}
