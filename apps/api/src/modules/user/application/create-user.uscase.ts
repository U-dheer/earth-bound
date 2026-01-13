import { BadRequestException, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { UserService } from '../infrastructure/user.service';
import { CreateUserDto } from '../dto/user.dto';

// as an business owner, I want to create an inventory adjustment
@Injectable()
export class CreateUserUsecase {
  constructor(private readonly userService: UserService) {}

  async execute(data: CreateUserDto) {
    try {
      const user = await this.userService.createUser(data);
      return user;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create user',
      );
    }
  }
}
