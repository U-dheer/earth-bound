import { Injectable } from '@nestjs/common';
import { OrganizerRepository } from './organizer.repository';
import { CreateOrganizerDto } from 'src/modules/organizer/dto/createOrganizer.dto';

@Injectable()
export class OrganizerService {
  constructor(private readonly organizerRepository: OrganizerRepository) {}

  async CreateOrganizer(organizerData: CreateOrganizerDto) {
    return this.organizerRepository.createOrganizer(organizerData);
  }
}
