import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';

@Injectable()
export class FindActivatedCsrProjectsUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute() {
    try {
      const projects =
        await this.csrProjectService.findByActivationStatus(true);
      return projects;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch activated CSR projects',
      );
    }
  }
}
