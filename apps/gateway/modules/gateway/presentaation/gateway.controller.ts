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
  Res,
} from '@nestjs/common';
import { GatewayService } from '../infrastructure/gateway.service';
import { type Response } from 'express';

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
  async forwardPost(
    @Req() req,
    @Body() body: any,
    @Headers() headers: any,
    @Res() res: Response,
  ) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    const response = await this.gatewayService.forwardRequest(
      req.method,
      req.url,
      payload,
      headers,
    );

    // Forward all headers from the service response
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value as unknown as string | number);
      });
    }

    // Forward cookies if they exist in Set-Cookie header
    if (response.headers?.['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }

    return res.status(response.status).send(response.data);
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
