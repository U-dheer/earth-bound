import { Inject, Injectable } from '@nestjs/common';
import { type DrizzleClient } from '../../../shared/database/drizzle.module';
import { CreateOrganizerDto } from '../dto/createOrganizer.dto';
import { organizers } from './schema/organizer.schema';

@Injectable()
export class OrganizerRepository {
  constructor(@Inject('DRIZZLE_CLIENT') private readonly db: DrizzleClient) {}

  async createOrganizer(data: CreateOrganizerDto) {
    const [result] = await this.db.insert(organizers).values(data).returning();
    return result;
  }
}
