import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';

@Injectable()
export class FindOrganizerProjectsWithDonationsUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(organizerId: string) {
    try {
      const projects =
        await this.csrProjectService.findByOrganizerIdWithTotalDonations(
          organizerId,
        );
      return projects;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch CSR projects with donations for organizer',
      );
    }
  }
}
