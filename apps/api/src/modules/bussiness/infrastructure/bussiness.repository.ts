import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleClient } from 'src/shared/database/drizzle.module';
import { businesses } from './schema/business.schema';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';

@Injectable()
export class BussinessRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createBussiness(data: CreateBussinessDto) {
    const [result] = await this.db.insert(businesses).values(data).returning();
    return result;
  }
}
