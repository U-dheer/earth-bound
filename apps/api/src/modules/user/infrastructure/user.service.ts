import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: CreateUserDto) {
    return this.userRepository.create(userData);
  }

  async findUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, userData: UpdateUserDto) {
    return this.userRepository.update(id, userData);
  }

  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}
