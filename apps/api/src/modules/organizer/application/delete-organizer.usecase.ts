import { BadRequestException, Injectable } from '@nestjs/common';
import { OrganizerService } from '../infrastructure/organizer.service';

@Injectable()
export class DeleteOrganizerUseCase {
  constructor(private readonly organizerService: OrganizerService) {}

  async execute(id: string) {
    try {
      const organizer = await this.organizerService.delete(id);
      return organizer;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete organizer',
      );
    }
  }
}
