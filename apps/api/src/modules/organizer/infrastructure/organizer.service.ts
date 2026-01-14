import { Injectable } from '@nestjs/common';
import { OrganizerRepository } from './organizer.repository';
import { CreateOrganizerDto } from 'src/modules/organizer/dto/createOrganizer.dto';

@Injectable()
export class OrganizerService {
  constructor(private readonly organizerRepository: OrganizerRepository) {}

  async CreateOrganizer(organizerData: CreateOrganizerDto) {
    return this.organizerRepository.createOrganizer(organizerData);
  }

  async findById(id: string) {
    return this.organizerRepository.findById(id);
  }

  async update(id: string, data: Partial<CreateOrganizerDto>) {
    return this.organizerRepository.update(id, data);
  }

  async delete(id: string) {
    return this.organizerRepository.delete(id);
  }
}
