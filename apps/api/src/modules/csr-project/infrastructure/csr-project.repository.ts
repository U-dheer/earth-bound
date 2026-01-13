import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { csrEvents } from './schema/csr.event.schema';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Injectable()
export class CsrProjectRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateCsrDto) {
    const [result] = await this.db.insert(csrEvents).values(data).returning();
  }
}
