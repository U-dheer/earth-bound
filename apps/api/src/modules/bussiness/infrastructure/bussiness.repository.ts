import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleClient } from 'src/shared/database/drizzle.module';
import { businesses } from './schema/business.schema';
import { CreateBussinessDto } from '../dto/created.bussiness.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class BussinessRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createBussiness(data: CreateBussinessDto) {
    const [result] = await this.db.insert(businesses).values(data).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)
      .execute();

    return result;
  }

  async update(id: string, data: Partial<CreateBussinessDto>) {
    const [result] = await this.db
      .update(businesses)
      .set(data)
      .where(eq(businesses.id, id))
      .returning();

    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(businesses)
      .where(eq(businesses.id, id))
      .returning();

    return result;
  }
}
