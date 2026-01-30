import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { GatewayController } from './presentaation/gateway.controller';
import { GatewayService } from './infrastructure/gateway.service';
import { AuthenticationService } from './auth/services/auth.service';
import { AuthMiddleware } from './auth/middleware/auth.middleware';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService, AuthenticationService],
  exports: [GatewayService, AuthenticationService],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to all routes
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
