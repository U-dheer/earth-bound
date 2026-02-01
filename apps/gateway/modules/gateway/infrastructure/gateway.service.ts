import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { resolveServiceUrl } from '../utils/url-resolver';
import axios from 'axios';
import { AxiosError } from 'axios';
import { AuthenticatedUser } from '../auth';

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

      return method === 'POST' ? response : response.data;
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
        throw new BadRequestException(error.response?.data);
      } else {
        console.error('Unexpected error in GatewayService:', error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
