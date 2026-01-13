import { Injectable } from '@nestjs/common';
import { CsrProjectRepository } from './csr-project.repository';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Injectable()
export class CsrProjectService {
  constructor(private readonly csrProjectRepository: CsrProjectRepository) {}

  async createCsrProject(projectData: CreateCsrDto) {
    await this.csrProjectRepository.create(projectData);
  }
}
