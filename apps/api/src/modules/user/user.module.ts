import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/drizzle.module';
import { UserController } from './presentation/user.controller';
import { UserService } from './infrastructure/user.service';
import { UserRepository } from './infrastructure/user.repository';
import { CreateUserUsecase } from './application/create-user.uscase';
import { FindUserByIdUseCase } from './application/find-user-by-id.usecase';
import { UpdateUserUseCase } from './application/update-user.usecase';
import { DeleteUserUseCase } from './application/delete-user.usecase';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    CreateUserUsecase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
