import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../infrastructure/user.service';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(id: string) {
    try {
      const user = await this.userService.deleteUser(id);
      return user;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete user',
      );
    }
  }
}
