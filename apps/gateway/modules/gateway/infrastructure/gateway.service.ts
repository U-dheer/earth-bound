import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { resolveServiceUrl } from '../utils/url-resolver';
import axios from 'axios';
import { AxiosError } from 'axios';

@Injectable()
export class GatewayService {
  async forwardRequest(
    method: string,
    path: string,
    body?: any,
    headers?: any,
  ): Promise<any> {
    try {
      const serviceUrl = resolveServiceUrl(path);
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
      if (error instanceof AxiosError) {
        throw new BadRequestException(error.response?.data);
      } else {
        console.error('Unexpected error in GatewayService:', error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
