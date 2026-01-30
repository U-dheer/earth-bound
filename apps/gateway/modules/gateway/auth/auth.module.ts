import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthenticationService } from './services/auth.service';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to all routes
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
