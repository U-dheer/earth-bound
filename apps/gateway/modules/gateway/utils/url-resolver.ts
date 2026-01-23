import { ServicesConfig } from '../configs/service-config';

export const resolveServiceUrl = (path: string): string => {
  if (path.startsWith('/auth')) {
    const url = ServicesConfig.auth;
    if (!url) {
      throw new Error('Auth service URL is not configured');
    }
    return url;
  }
  if (path.startsWith('/api')) {
    const url = ServicesConfig.api;
    if (!url) {
      throw new Error('Api service URL is not configured');
    }
    return url;
  }
  throw new Error(`No service found for path: ${path}`);
};
