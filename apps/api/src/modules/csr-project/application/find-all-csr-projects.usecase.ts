import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';

@Injectable()
export class FindAllCsrProjectsUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute() {
    try {
      const projects = await this.csrProjectService.findAll();
      return projects;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to fetch CSR projects',
      );
    }
  }
}
