import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
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

  @Post('*')
  async forwardPost(@Req() req, @Body() body: any, @Headers() headers: any) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      payload,
      headers,
    );
  }

  @Put('*')
  async forwardPut(@Req() req, @Body() body: any, @Headers() headers: any) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      payload,
      headers,
    );
  }

  @Patch('*')
  async forwardPatch(@Req() req, @Body() body: any, @Headers() headers: any) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      payload,
      headers,
    );
  }

  @Delete('*')
  async forwardDelete(@Req() req, @Headers() headers: any) {
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      undefined,
      headers,
    );
  }
}
