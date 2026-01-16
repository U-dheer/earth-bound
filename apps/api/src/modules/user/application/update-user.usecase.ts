import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../infrastructure/user.service';
import { CreateUserDto } from '../dto/user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(id: string, data: Partial<CreateUserDto>) {
    try {
      const user = await this.userService.updateUser(id, data);
      return user;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update user',
      );
    }
  }
}
