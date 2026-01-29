import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { and, eq } from 'drizzle-orm';
import { CreateUserDto } from '../dto/user.dto';
import { users } from './schema/user.schema';

@Injectable()
export class UserRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async create(data: CreateUserDto) {
    try {
      console.log('Creating user with data:', data);
      const [result] = await this.db.insert(users).values(data).returning();
      return result;
    } catch (error) {
      console.error('Error in UserRepository.create:', error);
      throw error;
    }
  }

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .execute();
    return result;
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    const [result] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(users)
      .where(and(eq(users.id, id)))
      .returning();
    return result;
  }
}
