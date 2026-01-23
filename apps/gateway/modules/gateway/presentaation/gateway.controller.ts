import { Controller, Get, Headers, Req } from '@nestjs/common';
import { GatewayService } from '../infrastructure/gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('*')
  async forwardGet(@Req() req, @Headers() headers: any) {
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      undefined,
      headers,
    );
  }
}
