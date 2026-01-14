import { Injectable } from '@nestjs/common';
import { CsrProjectRepository } from './csr-project.repository';
import { CreateCsrDto } from '../dto/create_csr-project.dto';

@Injectable()
export class CsrProjectService {
  constructor(private readonly csrProjectRepository: CsrProjectRepository) {}

  async createCsrProject(projectData: CreateCsrDto) {
    return this.csrProjectRepository.create(projectData);
  }

  async findById(id: string) {
    return this.csrProjectRepository.findById(id);
  }

  async update(id: string, data: Partial<CreateCsrDto>) {
    return this.csrProjectRepository.update(id, data);
  }

  async delete(id: string) {
    return this.csrProjectRepository.delete(id);
  }
}
