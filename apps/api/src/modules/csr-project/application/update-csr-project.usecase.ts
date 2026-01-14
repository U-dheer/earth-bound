import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Injectable()
export class UpdateCsrProjectUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(id: string, data: Partial<CreateCsrDto>) {
    try {
      const project = await this.csrProjectService.update(id, data);
      return project;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update CSR project',
      );
    }
  }
}
