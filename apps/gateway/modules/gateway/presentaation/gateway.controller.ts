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
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from '../infrastructure/gateway.service';
import { type Response } from 'express';
import { type AuthenticatedUser, CurrentUser } from '../auth';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('*')
  async forwardGet(
    @Req() req,
    @Headers() headers: any,
    @CurrentUser('role') userRole: string | undefined,
  ) {
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      userRole,
      undefined,
      headers,
    );
  }

  @Post('*')
  async forwardPost(
    @Req() req,
    @Body() body: any,
    @CurrentUser('role') userRole: string | undefined,
    @Headers() headers: any,
    @Res() res: Response,
  ) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;

    // Extract cookies from incoming request
    const cookies = req.cookies || {};
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    // Add cookies to headers
    const headersWithCookies = {
      ...headers,
      ...(cookieString && { cookie: cookieString }),
    };

    const response = await this.gatewayService.forwardRequest(
      req.method,
      req.url,
      userRole,
      payload,
      headersWithCookies,
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
  async forwardPut(
    @Req() req,
    @Body() body: any,
    @Headers() headers: any,
    @CurrentUser('role') userRole: string | undefined,
  ) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      userRole,
      payload,
      headers,
    );
  }

  @Patch('*')
  async forwardPatch(
    @Req() req,
    @Body() body: any,
    @Headers() headers: any,
    @CurrentUser('role') userRole: string | undefined,
  ) {
    const contentType = headers?.['content-type'] || headers?.['Content-Type'];
    const isMultipart =
      contentType && contentType.includes('multipart/form-data');
    const payload = isMultipart ? req : body;
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      userRole,
      payload,
      headers,
    );
  }

  @Delete('*')
  async forwardDelete(
    @Req() req,
    @Headers() headers: any,
    @CurrentUser('role') userRole: string | undefined,
  ) {
    return this.gatewayService.forwardRequest(
      req.method,
      req.url,
      userRole,
      undefined,
      headers,
    );
  }
}
