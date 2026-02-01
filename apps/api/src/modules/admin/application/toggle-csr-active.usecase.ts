import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CsrProjectService } from '../../csr-project/infrastructure/csr-project.service';

@Injectable()
export class ToggleCsrActiveUseCase {
  constructor(private readonly csrProjectService: CsrProjectService) {}

  async execute(id: string) {
    try {
      const project = await this.csrProjectService.findById(id);

      if (!project) {
        throw new NotFoundException(`CSR project with id ${id} not found`);
      }

      const updatedProject = await this.csrProjectService.update(id, {
        isApproved: !project.isApproved,
      } as any);

      return {
        message: `CSR project ${updatedProject.isApproved ? 'activated' : 'deactivated'} successfully`,
        data: updatedProject,
      };
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
