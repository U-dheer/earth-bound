import { BadRequestException, Injectable } from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Injectable()
export class CreateCsrProjectUsecase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(data: CreateCsrDto) {
    try {
      const csrProject = await this.csrProjectService.createCsrProject(data);
      return csrProject;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create CSR Project',
      );
    }
  }
}
