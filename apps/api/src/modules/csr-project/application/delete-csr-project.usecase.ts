import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';

@Injectable()
export class DeleteCsrProjectUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(id: string) {
    try {
      const project = await this.csrProjectService.delete(id);
      return project;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete CSR project',
      );
    }
  }
}
