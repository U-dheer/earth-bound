import { Module } from '@nestjs/common';
import { GatewayController } from './presentaation/gateway.controller';
import { GatewayService } from './infrastructure/gateway.service';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
