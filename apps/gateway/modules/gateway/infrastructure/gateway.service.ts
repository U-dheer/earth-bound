import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { resolveServiceUrl } from '../utils/url-resolver';
import axios from 'axios';
import { AxiosError } from 'axios';
import { AuthenticatedUser } from '../auth';
import { response } from 'express';

@Injectable()
export class GatewayService {
  async forwardRequest(
    method: string,
    path: string,
    role?: AuthenticatedUser['role'],
    body?: any,
    headers?: any,
  ): Promise<any> {
    try {
      const serviceUrl = resolveServiceUrl(path, role, method);
      console.log(`Resolved service URL: ${path}`);

      console.log(`Forwarding request to: ${serviceUrl}${path}`);
      let refinedUrl = serviceUrl + path;
      console.log(`Refined URL: ${refinedUrl}`);

      const forwardedHeaders: any = {
        Accept: headers?.['accept'] || '*/*',
        ...(headers?.['authorization'] && {
          Authorization: headers['authorization'],
        }),
        ...(headers?.['cookie'] && { Cookie: headers['cookie'] }),
      };

      if (headers?.['content-type']) {
        forwardedHeaders['Content-Type'] = headers['content-type'];
      }

      console.log('Forwarded Headers:', forwardedHeaders);
      console.log('Body:', body);
      console.log('Method:', method);
      console.log('URL:', refinedUrl);

      const response = await axios.request({
        method,
        url: refinedUrl,
        data: body,
        headers: forwardedHeaders,
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        withCredentials: true,
      });

      return response;
    } catch (error) {
      // Re-throw NestJS HTTP exceptions (ForbiddenException, NotFoundException, etc.)
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error instanceof AxiosError) {
        console.error('Error in GatewayService Axios request:', {
          message: error.message,
          responseData: error.response?.data,
          status: error.response?.status,
        });
        switch (error.status) {
          case 400:
            throw new BadRequestException(error.response?.data);
          case 401:
            throw new UnauthorizedException(error.response?.data);
          case 403:
            throw new ForbiddenException(error.response?.data);
          case 404:
            throw new NotFoundException(error.response?.data);
          case 409:
            throw new ConflictException(error.response?.data);
          case 422:
            throw new UnprocessableEntityException(error.response?.data);
          case 500:
            throw new InternalServerErrorException(error.response?.data);
          default:
            throw new InternalServerErrorException(
              error.response?.data || error.message,
            );
        }
      } else {
        console.error('Unexpected error in GatewayService:', error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
