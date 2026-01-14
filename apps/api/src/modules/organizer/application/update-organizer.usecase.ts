import { BadRequestException, Injectable } from '@nestjs/common';
import { OrganizerService } from '../infrastructure/organizer.service';
import { CreateOrganizerDto } from '../dto/createOrganizer.dto';

@Injectable()
export class UpdateOrganizerUseCase {
  constructor(private readonly organizerService: OrganizerService) {}

  async execute(id: string, data: Partial<CreateOrganizerDto>) {
    try {
      const organizer = await this.organizerService.update(id, data);
      return organizer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update organizer',
      );
    }
  }
}
