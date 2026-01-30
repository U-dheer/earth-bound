import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ServicesConfig } from '../../configs/service-config';
import {
  TokenValidationResponse,
  TokenRefreshResponse,
} from '../interfaces/auth.interfaces';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  /**
   * Validates an access token with the auth service
   * @param token - The access token to validate
   * @returns TokenValidationResponse with user data if valid
   */
  async validateToken(token: string): Promise<TokenValidationResponse> {
    try {
      const response = await axios.post<TokenValidationResponse>(
        `${ServicesConfig.auth}/auth/validate`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.warn(
          `Token validation failed: ${error.response?.data?.message || error.message}`,
        );

        // Check if token is expired
        if (
          error.response?.status === 401 &&
          error.response?.data?.message?.includes('expired')
        ) {
          throw new TokenExpiredError('Access token has expired');
        }
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Refreshes tokens using a refresh token
   * @param refreshToken - The refresh token to use
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      this.logger.debug('Attempting to refresh tokens...');

      const response = await axios.post(
        `${ServicesConfig.auth}/auth/refresh`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `refreshToken=${refreshToken}`,
          },
          timeout: 5000,
          withCredentials: true,
        },
      );

      this.logger.debug(`Refresh response status: ${response.status}`);

      // Extract new tokens from response cookies
      const setCookieHeader = response.headers['set-cookie'];
      let newAccessToken = '';
      let newRefreshToken = '';

      if (setCookieHeader && Array.isArray(setCookieHeader)) {
        this.logger.debug(`Found ${setCookieHeader.length} Set-Cookie headers`);

        for (const cookie of setCookieHeader) {
          if (cookie.includes('accessToken=')) {
            newAccessToken = this.extractCookieValue(cookie, 'accessToken');
            this.logger.debug('Extracted new access token from cookies');
          }
          if (cookie.includes('refreshToken=')) {
            newRefreshToken = this.extractCookieValue(cookie, 'refreshToken');
            this.logger.debug('Extracted new refresh token from cookies');
          }
        }
      } else {
        this.logger.warn('No Set-Cookie headers found in refresh response');
      }

      if (!newAccessToken) {
        this.logger.error(
          'Failed to extract access token from refresh response',
        );
        throw new UnauthorizedException(
          'Failed to refresh tokens - no access token received',
        );
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken, // Fall back to old refresh token if not rotated
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Token refresh failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        );
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to refresh tokens');
    }
  }

  /**
   * Extracts a cookie value from a Set-Cookie header string
   */
  private extractCookieValue(cookieString: string, name: string): string {
    const match = cookieString.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : '';
  }
}

/**
 * Custom error class for expired tokens
 */
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}
