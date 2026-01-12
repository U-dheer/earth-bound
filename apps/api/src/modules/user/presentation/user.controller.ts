import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserUsecase } from '../application/create-user.uscase';
import { CreateUserDto } from '../dto/user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly createUserUsecase: CreateUserUsecase) {}

  //   @ApiOperation({
  //     operationId: ADJUSTMENT_API_OPERATIONS.CREATE.operationId,
  //     description: ADJUSTMENT_API_OPERATIONS.CREATE.description,
  //   })
  @Post('create')
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() dto: CreateUserDto) {
    return await this.createUserUsecase.execute(dto);
  }
}
