import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserUsecase } from '../application/create-user.uscase';
import { FindUserByIdUseCase } from '../application/find-user-by-id.usecase';
import { UpdateUserUseCase } from '../application/update-user.usecase';
import { DeleteUserUseCase } from '../application/delete-user.usecase';
import { CreateUserDto } from '../dto/user.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('create')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.createUserUsecase.execute(dto);
  }

  @Get('')
  async findById(@CurrentUser('userId') userId: any) {
    return await this.findUserByIdUseCase.execute(userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
    return await this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteUserUseCase.execute(id);
  }
}
