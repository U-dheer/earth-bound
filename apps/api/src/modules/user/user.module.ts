import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/drizzle.module';
import { UserController } from './presentation/user.controller';
import { UserService } from './infrastructure/user.service';
import { UserRepository } from './infrastructure/user.repository';
import { CreateUserUsecase } from './application/create-user.uscase';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserRepository, UserService, CreateUserUsecase],
  exports: [UserService, UserRepository],
})
export class UserModule {}
