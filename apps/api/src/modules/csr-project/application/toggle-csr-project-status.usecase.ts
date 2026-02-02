import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CsrProjectService } from '../infrastructure/csr-project.service';

@Injectable()
export class ToggleCsrProjectStatusUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(id: string) {
    try {
      const project = await this.csrProjectService.findById(id);

      if (!project) {
        throw new NotFoundException('CSR project not found');
      }

      const updatedProject = await this.csrProjectService.toggleStatus(
        id,
        !project.isApproved,
      );
      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to toggle CSR project status',
      );
    }
  }
}
